<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\StorageListBundle\Controller;

use CoreShop\Bundle\StorageListBundle\Form\Type\CreatedNamedStorageListType;
use CoreShop\Component\Customer\Model\CustomerAwareInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use CoreShop\Component\StorageList\Factory\StorageListFactoryInterface;
use CoreShop\Component\StorageList\Provider\ContextProviderInterface;
use CoreShop\Component\StorageList\Resolver\StorageListResolverInterface;
use CoreShop\Component\StorageList\Storage\StorageListStorageInterface;
use CoreShop\Component\StorageList\StorageListManagerInterface;
use Pimcore\Model\DataObject\Concrete;
use Psr\Container\ContainerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\ClickableInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Contracts\Translation\TranslatorInterface;

class StorageMultiListController extends AbstractController
{
    public function __construct(
        ContainerInterface $container,
        protected string $identifier,
        protected StorageListContextInterface $context,
        protected FormFactoryInterface $formFactory,
        protected RepositoryInterface $repository,
        protected StorageListFactoryInterface $storageListFactory,
        protected ContextProviderInterface $contextProvider,
        protected StorageListManagerInterface $manager,
        protected TranslatorInterface $translator,
        protected StorageListStorageInterface $storage,
        protected StorageListResolverInterface $listResolver,
        protected string|null $listFormType,
        protected string $templateCreateNewList,
        protected string $templateListStorageLists,
    ) {
        $this->setContainer($container);
    }

    public function createNamedStorageListAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $this->denyAccessUnlessGranted(sprintf('CORESHOP_STORAGE_LIST_CREATED_%s', strtoupper($this->identifier)));

        $form = $this->formFactory->createNamed('coreshop', CreatedNamedStorageListType::class);

        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH'])) {
            $form->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                $data = $form->getData();
                $storageList = $this->storageListFactory->createNewNamed($data['name']);

                $this->contextProvider->provideContextForStorageList($storageList);

                $this->manager->persist($storageList);

                $this->storage->setForContext($this->contextProvider->getCurrentContext(), $storageList);

                $this->addFlash(
                    'success',
                    $this->translator->trans(sprintf('coreshop.ui.%s.created', $this->identifier))
                );

                if ($request->isXmlHttpRequest()) {
                    return new JsonResponse([
                        'success' => true,
                    ]);
                }

                return $this->redirect($request->getUri());
            }
        }

        $template = $this->getParameterFromRequest($request, 'template', $this->templateCreateNewList);

        return $this->render(
            $template,
            [
                'form' => $form->createView(),
            ],
        );
    }

    public function listStorageListAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $this->denyAccessUnlessGranted('CORESHOP_STORAGE_LIST_MULTI_LIST_'.$this->identifier);

        $storageLists = $this->listResolver->getStorageLists($this->contextProvider->getCurrentContext());
        $storageList = $this->context->getStorageList();

        $params = [
            'lists' => $storageLists,
            'list' => $storageList,
        ];

        if (null !== $this->listFormType) {
            $form = $this->container->get('form.factory')->createNamed(
                'coreshop',
                $this->listFormType,
                ['list' => $storageList],
                [
                    'context' => $this->contextProvider->getCurrentContext(),
                ]
            );

            if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH'])) {
                $form->handleRequest($request);

                if ($form->isSubmitted() && $form->isValid()) {
                    $list = $form->getData()['list'];

                    if (interface_exists(CustomerAwareInterface::class)) {
                        if ($list instanceof CustomerAwareInterface &&
                            $list->getCustomer()?->getId() !==
                            $this->contextProvider->getCurrentContext()['customer']->getId()
                        ) {
                            throw new AccessDeniedException();
                        }
                    }

                    if ($form->has('deleteList')) {
                        $deleteListButton = $form->get('deleteList');

                        $deleteClicked = $deleteListButton instanceof ClickableInterface &&
                            $deleteListButton->isClicked();

                        if ($deleteClicked) {
                            if ($list instanceof Concrete) {
                                $list->delete();
                            }

                            return new RedirectResponse(
                                $request->headers->get('referer', $request->getSchemeAndHttpHost())
                            );
                        }
                    }

                    $this->storage->setForContext($this->contextProvider->getCurrentContext(), $list);

                    return new RedirectResponse(
                        $request->headers->get('referer', $request->getSchemeAndHttpHost())
                    );
                }
            }


            $params['form'] = $form;
        }

        $template = $this->getParameterFromRequest($request, 'template', $this->templateListStorageLists);

        return $this->render($template, $params);
    }

    /**
     * @return mixed
     *
     * based on Symfony\Component\HttpFoundation\Request::get
     */
    protected function getParameterFromRequest(Request $request, string $key, $default = null)
    {
        if ($request !== $result = $request->attributes->get($key, $request)) {
            return $result;
        }

        if ($request->query->has($key)) {
            return $request->query->all()[$key];
        }

        if ($request->request->has($key)) {
            return $request->request->all()[$key];
        }

        return $default;
    }
}
