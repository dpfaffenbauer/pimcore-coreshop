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

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use CoreShop\Component\StorageList\DTO\AddToStorageListInterface;
use CoreShop\Component\StorageList\Factory\AddToStorageListFactoryInterface;
use CoreShop\Component\StorageList\Factory\StorageListFactoryInterface;
use CoreShop\Component\StorageList\Factory\StorageListItemFactoryInterface;
use CoreShop\Component\StorageList\Model\ShareableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListItemInterface;
use CoreShop\Component\StorageList\Repository\ShareableStorageListRepositoryInterface;
use CoreShop\Component\StorageList\StorageListManagerInterface;
use CoreShop\Component\StorageList\StorageListModifierInterface;
use Psr\Container\ContainerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class StorageListController extends AbstractController
{
    public function __construct(
        ContainerInterface $container,
        protected string $identifier,
        protected FormFactoryInterface $formFactory,
        protected RepositoryInterface $repository,
        protected RepositoryInterface $productRepository,
        protected RepositoryInterface $itemRepository,
        protected StorageListContextInterface $context,
        protected StorageListFactoryInterface $storageListFactory,
        protected StorageListItemFactoryInterface $storageListItemFactory,
        protected AddToStorageListFactoryInterface $addToStorageListFactory,
        protected StorageListModifierInterface $modifier,
        protected StorageListManagerInterface $manager,
        protected string $addToStorageListForm,
        protected string $form,
        protected string $summaryRoute,
        protected string $indexRoute,
        protected string $templateAddToList,
        protected string $templateSummary,
        protected TranslatorInterface $translator,
    ) {
        $this->setContainer($container);
    }

    public function addItemAction(Request $request): Response
    {
        $privilege = sprintf('CORESHOP_%s', strtoupper($this->identifier));
        $privilegeAdd = sprintf('CORESHOP_%s_ADD_ITEM', strtoupper($this->identifier));
        if ($request->isMethod('GET') && !($this->isGranted($privilege) && $this->isGranted($privilegeAdd))) {
            return $this->render(
                $this->getParameterFromRequest($request, 'template', $this->templateAddToList),
                [
                    'form' => null,
                    'product' => null,
                ],
            );
        }
        $this->denyAccessUnlessGranted($privilege);
        $this->denyAccessUnlessGranted($privilegeAdd);

        $redirect = $this->getParameterFromRequest($request, '_redirect', $this->generateUrl($this->summaryRoute));
        $product = $this->productRepository->find($this->getParameterFromRequest($request, 'product'));
        $storageList = $this->context->getStorageList();

        if (!$product instanceof ResourceInterface) {
            if ($request->isXmlHttpRequest()) {
                return new JsonResponse([
                    'success' => false,
                ]);
            }

            return $this->redirect($redirect);
        }

        $item = $this->storageListItemFactory->createWithStorageListProduct($product);

        $addToStorageList = $this->createAddToStorageList($storageList, $item);

        $form = $this->formFactory->createNamed(
            'coreshop-' . $product->getId(),
            $this->addToStorageListForm,
            $addToStorageList,
        );

        if ($request->isMethod('POST')) {
            $form->handleRequest($request);

            if ($form->isSubmitted() && $form->isValid()) {
                /**
                 * @var AddToStorageListInterface $addToStorageList
                 */
                $addToStorageList = $form->getData();

                $this->modifier->addToList($addToStorageList->getStorageList(), $addToStorageList->getStorageListItem());
                $this->manager->persist($storageList);

                $this->addFlash('success', $this->translator->trans('coreshop.ui.item_added'));

                if ($request->isXmlHttpRequest()) {
                    return new JsonResponse([
                        'success' => true,
                    ]);
                }

                return $this->redirect($redirect);
            }

            /**
             * @var FormError $error
             */
            foreach ($form->getErrors(true, true) as $error) {
                $this->addFlash('error', $error->getMessage());
            }

            if ($request->isXmlHttpRequest()) {
                return new JsonResponse([
                    'success' => false,
                    'errors' => array_map(static function (FormError $error) {
                        return $error->getMessage();
                    }, iterator_to_array($form->getErrors(true))),
                ]);
            }

            return $this->redirect($redirect);
        }

        if ($request->isXmlHttpRequest()) {
            return new JsonResponse([
                'success' => false,
            ]);
        }

        $template = $this->getParameterFromRequest($request, 'template', $this->templateAddToList);

        return $this->render(
            $template,
            [
                'form' => $form->createView(),
                'product' => $product,
            ],
        );
    }

    public function removeItemAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted(sprintf('CORESHOP_%s', strtoupper($this->identifier)));
        $this->denyAccessUnlessGranted(sprintf('CORESHOP_%s_REMOVE_ITEM', strtoupper($this->identifier)));

        $storageListItem = $this->itemRepository->find($this->getParameterFromRequest($request, 'item'));
        $storageList = $this->context->getStorageList();

        if (!$storageListItem instanceof StorageListItemInterface) {
            return $this->redirectToRoute($this->indexRoute);
        }

        if ($storageListItem->getStorageList()->getId() !== $storageList->getId()) {
            return $this->redirectToRoute($this->indexRoute);
        }

        $this->addFlash('success', $this->translator->trans('coreshop.ui.item_removed'));

        $this->modifier->removeFromList($storageList, $storageListItem);
        $this->manager->persist($storageList);

        $request->attributes->set('product', $storageListItem->getProduct());

        return $this->redirectToRoute($this->summaryRoute);
    }

    public function summaryAction(Request $request): Response
    {
        $repository = $this->repository;
        $isSharedList = false;

        if ($request->attributes->get('identifier')) {
            if (!$repository instanceof ShareableStorageListRepositoryInterface) {
                throw new NotFoundHttpException();
            }

            $list = $repository->findByToken($request->attributes->get('identifier'));
            $isSharedList = true;

            if (null === $list) {
                throw new NotFoundHttpException();
            }
        } else {
            $list = $this->context->getStorageList();
        }

        $this->denyAccessUnlessGranted(sprintf('CORESHOP_%s', strtoupper($this->identifier)), $list);
        $this->denyAccessUnlessGranted(sprintf('CORESHOP_%s_SUMMARY', strtoupper($this->identifier)), $list);

        $params = [
            'storage_list' => $list,
            'is_shared_list' => $isSharedList,
        ];

        if (!$isSharedList) {
            $form = $this->formFactory->createNamed('coreshop', $this->form, $list);
            $form->handleRequest($request);

            if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH']) && $form->isSubmitted()) {
                if ($form->isValid()) {
                    $list = $form->getData();

                    $this->addFlash('success', $this->translator->trans('coreshop.ui.cart_updated'));

                    $this->manager->persist($list);

                    return $this->redirectToRoute($this->summaryRoute);
                }

                $session = $request->getSession();

                if ($session instanceof Session) {
                    /**
                     * @var FormError $error
                     */
                    foreach ($form->getErrors() as $error) {
                        $session->getFlashBag()->add('error', $error->getMessage());
                    }

                    return $this->redirectToRoute($this->summaryRoute);
                }
            }

            $params['form'] = $form->createView();
        }

        if (!$isSharedList && $list instanceof ShareableStorageListInterface && $list->listCanBeShared()) {
            $params['share_link'] = $this->generateUrl($this->summaryRoute, ['identifier' => $list->getToken()], UrlGeneratorInterface::ABSOLUTE_URL);
        }

        return $this->render($this->templateSummary, $params);
    }

    protected function createAddToStorageList(
        StorageListInterface $storageList,
        StorageListItemInterface $storageListItem,
    ): AddToStorageListInterface {
        return $this->addToStorageListFactory->createWithStorageListAndStorageListItem($storageList, $storageListItem);
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
