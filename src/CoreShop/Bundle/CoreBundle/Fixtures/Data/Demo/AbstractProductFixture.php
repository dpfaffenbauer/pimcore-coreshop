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

namespace CoreShop\Bundle\CoreBundle\Fixtures\Data\Demo;

use CoreShop\Component\Core\Model\CategoryInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Repository\CategoryRepositoryInterface;
use CoreShop\Component\Core\Repository\ProductRepositoryInterface;
use CoreShop\Component\Pimcore\DataObject\ObjectServiceInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\Store\Repository\StoreRepositoryInterface;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Faker\Factory;
use Faker\Provider\Barcode;
use Faker\Provider\Lorem;
use Pimcore\Model\Asset;
use Pimcore\Model\DataObject\Service;
use Pimcore\Tool;
use Symfony\Component\HttpKernel\KernelInterface;

abstract class AbstractProductFixture extends Fixture implements DependentFixtureInterface
{
    protected static array $names = [
        [
            'de' => [
                'name' => 'Schwerlast Leder Brieftasche',
                'description' => 'Minus voluptatem asperiores quod excepturi quis. Quod non amet explicabo praesentium similique minima numquam corporis.',
            ],
            'en' => [
                'name' => 'Heavy Duty Leather Wallet',
                'description' => 'Debitis deserunt sunt voluptas neque voluptas molestias aut. Eligendi pariatur voluptatem voluptatum autem vel in. Quo labore modi facere qui earum aut. Nemo possimus est debitis.',
            ],
        ],
        [
            'de' => [
                'name' => 'Leicht Baumwolle Hose',
                'description' => 'Labore itaque et quia. Ad rerum reiciendis consequuntur. Incidunt totam aut qui voluptas. Nemo culpa dolorem ut eos suscipit.',
            ],
            'en' => [
                'name' => 'Lightweight Cotton Pants',
                'description' => 'Voluptas minus eos eveniet beatae est repudiandae ut. Deleniti exercitationem id incidunt voluptas. Aut facere voluptatem aut possimus sed est. Sint quia voluptas quisquam earum.',
            ],
        ],
        [
            'de' => [
                'name' => 'Fantastisch Gummi Wagen',
                'description' => 'Sint id harum autem nisi optio sunt. Quis voluptatem et iure reiciendis dolores pariatur. Itaque dolore vel dolorum id sunt quasi aperiam. Quia id porro eveniet consequatur.',
            ],
            'en' => [
                'name' => 'Fantastic Rubber Car',
                'description' => 'Sint doloremque itaque aut voluptate maiores ut. Odit delectus enim aut quis. Omnis expedita assumenda velit possimus recusandae animi deserunt. Placeat qui possimus rerum architecto architecto ut.',
            ],
        ],
        [
            'de' => [
                'name' => 'Enorm Papier Teller',
                'description' => 'Saepe vel earum soluta sit. Nam voluptatem non aliquam molestias explicabo suscipit qui. Dolorem aliquid et aut. Dicta similique totam culpa.',
            ],
            'en' => [
                'name' => 'Enormous Paper Plate',
                'description' => 'Porro delectus rem labore beatae dicta ullam aut. Alias modi amet deleniti neque optio libero. Repellendus mollitia quod pariatur quod iure.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Aluminium Mantel',
                'description' => 'Dolores doloremque repudiandae et ducimus aspernatur ut. Illo eum expedita quibusdam minima vel. Sint iste ratione rerum voluptatem voluptatum et fuga aut. Qui in aspernatur aut est numquam non et.',
            ],
            'en' => [
                'name' => 'Aerodynamic Aluminum Coat',
                'description' => 'Voluptatibus sit et quas eos. Eaque tenetur enim reprehenderit maxime aut consequatur velit ducimus. Ut eum qui esse commodi.',
            ],
        ],
        [
            'de' => [
                'name' => 'Genial Papier Schuhe',
                'description' => 'Inventore distinctio maiores ea animi non. Quasi tempora tenetur non. Non voluptatem libero possimus asperiores. Itaque consequatur autem consectetur sequi aut.',
            ],
            'en' => [
                'name' => 'Awesome Paper Shoes',
                'description' => 'Aut quasi minus et aut incidunt. Ratione recusandae ipsa temporibus magnam quis molestiae. Placeat nihil aperiam alias et.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Beton Messer',
                'description' => 'Est iste suscipit est vero. Qui nam aut voluptate voluptatem error enim et. Ut dolores facilis reiciendis autem. Dicta commodi impedit non consequuntur quia aut accusamus.',
            ],
            'en' => [
                'name' => 'Aerodynamic Concrete Knife',
                'description' => 'Dolores deleniti aut quisquam est aut. Vero ut omnis eligendi itaque consequuntur cum. Itaque repellat qui cum minus soluta consequatur.',
            ],
        ],
        [
            'de' => [
                'name' => 'Praktisch Baumwolle Tasche',
                'description' => 'Non asperiores aliquid ut est omnis. Eligendi vel eum aut aliquid tenetur. Quam amet facilis provident deserunt beatae maiores dolorum. Earum aut ut eligendi et in.',
            ],
            'en' => [
                'name' => 'Practical Cotton Bag',
                'description' => 'At est totam debitis sit quo natus nulla voluptatibus. Magnam nisi atque corrupti. Voluptas est culpa eligendi eius eum.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Stahl Brieftasche',
                'description' => 'Aliquam consequuntur sed omnis tempore ut consequatur. Sed laboriosam ex nostrum nemo ad at aliquid consequatur.',
            ],
            'en' => [
                'name' => 'Aerodynamic Steel Wallet',
                'description' => 'Sit corporis totam eos rerum qui. Enim cupiditate soluta reiciendis possimus dolor non. Reiciendis eos et error maxime dolorem quia et eaque.',
            ],
        ],
        [
            'de' => [
                'name' => 'Ergonomisch Papier Hut',
                'description' => 'Maiores tempora quo enim repellendus. Qui porro voluptates et quod. Et magni totam est est quos nobis ea. Nihil ducimus voluptas id nihil soluta.',
            ],
            'en' => [
                'name' => 'Ergonomic Paper Hat',
                'description' => 'Similique pariatur perferendis illo voluptatibus velit cum. Et dolor natus ab modi ipsum magnam enim. Aliquam asperiores doloremque vero aut corporis quis.',
            ],
        ],
        [
            'de' => [
                'name' => 'Praktisch Eisen Handschuhe',
                'description' => 'Incidunt temporibus voluptatem et qui eos. Dolores placeat similique provident in quasi repellendus. Consequatur similique dolore vel repudiandae accusantium dolores error.',
            ],
            'en' => [
                'name' => 'Practical Iron Gloves',
                'description' => 'Dolor vitae aut cum sequi voluptatem debitis vitae saepe. Est sint rerum facere vel. Amet ab voluptatem beatae consequatur libero et eligendi. Ut eos non pariatur.',
            ],
        ],
        [
            'de' => [
                'name' => 'Leicht Papier Messer',
                'description' => 'Reiciendis quo vel tempora facere unde ut et. A aut earum harum quasi animi. Architecto sunt eos dolores.',
            ],
            'en' => [
                'name' => 'Lightweight Paper Knife',
                'description' => 'Et aut ut commodi vero aliquam. Voluptatem asperiores eaque iste quia praesentium est asperiores. Dolor et maxime illum quo error est et. Aut non qui unde eos.',
            ],
        ],
        [
            'de' => [
                'name' => 'Glatt Stahl Mantel',
                'description' => 'Sunt non voluptas rerum qui tenetur dolor repellat. Ipsam harum quod consequatur et qui non et. Ut consequatur fugiat error voluptas vero totam in nihil.',
            ],
            'en' => [
                'name' => 'Sleek Steel Coat',
                'description' => 'Et commodi dolores animi quia et incidunt et. Animi qui amet eaque et. Repudiandae aut enim vel et facilis praesentium. Sit minima eaque distinctio alias. Omnis eum dolorem quis.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Beton Hemd',
                'description' => 'Nesciunt eos qui consectetur sint et accusamus possimus. Alias quis quasi qui vel est corporis consequuntur. Aspernatur facilis est ullam quia in et.',
            ],
            'en' => [
                'name' => 'Aerodynamic Concrete Shirt',
                'description' => 'Saepe autem quia dicta nemo suscipit. Repellat labore sit quas quo. Itaque qui vitae sunt quis quasi qui.',
            ],
        ],
        [
            'de' => [
                'name' => 'Genial Gummi Flasche',
                'description' => 'Laudantium hic in et nobis. Culpa illum tenetur aliquid iure adipisci exercitationem a. Perspiciatis vero ut accusamus minus incidunt numquam error.',
            ],
            'en' => [
                'name' => 'Awesome Rubber Bottle',
                'description' => 'Aut maxime sint similique quia. At maxime ea ab laudantium. Cum saepe odit sint eius earum est. Qui laudantium omnis est eligendi dolores ut.',
            ],
        ],
        [
            'de' => [
                'name' => "Mittelm\u00e4\u00dfig Granit Wagen",
                'description' => 'Molestiae ut ut quo qui atque a placeat. Asperiores vel deserunt qui natus maxime. Esse ut hic autem et. Porro ducimus ducimus debitis et quo quam.',
            ],
            'en' => [
                'name' => 'Mediocre Granite Car',
                'description' => 'Deleniti ab saepe voluptatem rerum amet sed. Et dolores aut est enim. Ea eaque eum suscipit et eius exercitationem. Dicta sapiente et eaque labore. Soluta laboriosam magni veniam quia est.',
            ],
        ],
        [
            'de' => [
                'name' => 'Herrlich Leder Uhr',
                'description' => 'Voluptas assumenda ratione impedit optio dolorem ea rerum. Qui in quidem cum consequatur natus eos quis.',
            ],
            'en' => [
                'name' => 'Gorgeous Leather Clock',
                'description' => 'Cum sed in doloremque repellendus velit veniam accusantium fugiat. Aut ea est eos iusto sunt voluptate. Provident possimus ipsa alias earum velit dolor ipsam.',
            ],
        ],
        [
            'de' => [
                'name' => 'Synergistisch Stahl Lampe',
                'description' => 'Est maiores qui vel. Aut aut labore rerum qui architecto tempora. Consectetur rerum veritatis magnam in numquam quidem ex. Et et molestiae quaerat rerum.',
            ],
            'en' => [
                'name' => 'Synergistic Steel Lamp',
                'description' => 'Et molestiae unde quo aliquid officiis omnis est. Veritatis voluptatem corporis accusantium qui molestiae sunt deleniti. Fuga tenetur molestias facere est et. Repellendus et ad omnis sunt sequi.',
            ],
        ],
        [
            'de' => [
                'name' => 'Intelligent Stahl Teller',
                'description' => 'Eius perspiciatis quia ipsam eum deserunt. Doloribus et quas architecto quia. Aut blanditiis sed nulla nesciunt.',
            ],
            'en' => [
                'name' => 'Intelligent Steel Plate',
                'description' => 'Sunt et quia molestias aut impedit quisquam provident. Vel nisi id odio harum ducimus iusto autem. Veniam ut et tenetur cumque animi nisi accusantium.',
            ],
        ],
        [
            'de' => [
                'name' => 'Genial Die Seide Tastatur',
                'description' => 'Distinctio voluptatem amet enim accusamus possimus nihil atque. Aspernatur fugit ad excepturi perferendis corrupti nihil.',
            ],
            'en' => [
                'name' => 'Awesome Silk Keyboard',
                'description' => 'Fuga quo excepturi iure dolor et eum assumenda. Omnis eum odio non tempora autem consequatur. Sed cum ut praesentium ut. Id est dignissimos magnam in dolores blanditiis.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Bronze Lampe',
                'description' => 'Impedit quisquam cumque voluptatum velit id. At maxime ipsam repellendus doloribus dolorem. Sit fugit sequi quis. Et veritatis animi culpa voluptates. Quibusdam hic id nemo quia veritatis dolorem.',
            ],
            'en' => [
                'name' => 'Aerodynamic Bronze Lamp',
                'description' => 'Voluptatem sequi corrupti rerum nihil blanditiis repudiandae totam. Qui quia incidunt magni inventore voluptatem quisquam. Ipsam odio odio nemo fugiat tempora minus nisi.',
            ],
        ],
        [
            'de' => [
                'name' => 'Leicht Baumwolle Flasche',
                'description' => 'Velit et ea natus delectus dolore. Qui odio earum a at quisquam delectus. Autem excepturi magnam iusto rerum in. Voluptatem et ullam minus minus odit quos voluptas.',
            ],
            'en' => [
                'name' => 'Lightweight Cotton Bottle',
                'description' => 'Aut voluptatibus voluptatem deserunt praesentium molestiae eveniet. Ex sed asperiores non tempore nihil. Rerum aut eos numquam mollitia enim provident.',
            ],
        ],
        [
            'de' => [
                'name' => 'Glatt Leder Bank',
                'description' => 'Consequatur saepe eius id labore. Accusamus nihil in excepturi aperiam est rerum. Earum voluptatem non saepe et consequuntur non eveniet. Eum qui earum dolores voluptas cum.',
            ],
            'en' => [
                'name' => 'Sleek Leather Bench',
                'description' => 'Eum autem at cumque non. In nihil et vitae. Error sit fugiat impedit explicabo vero consequuntur quia. Numquam quos aut molestiae iure.',
            ],
        ],
        [
            'de' => [
                'name' => "Mittelm\u00e4\u00dfig Leinen Mantel",
                'description' => 'Dignissimos magni adipisci cumque quia voluptatem ut. Pariatur consequatur labore aut omnis sit. Non dolorum ut officia qui.',
            ],
            'en' => [
                'name' => 'Mediocre Linen Coat',
                'description' => 'Facere velit aut eum vel dolor. Animi deleniti cum quia sit et voluptatem. Excepturi inventore quia voluptas voluptatem accusantium labore iusto. Quo fugit eaque sunt error qui sed.',
            ],
        ],
        [
            'de' => [
                'name' => 'Dauerhaft Eisen Hose',
                'description' => 'Accusamus quam sit sequi quo rerum ipsam. Ex enim molestiae dolores repudiandae quas dolor. Inventore odio ipsam quo quibusdam perferendis similique eos maiores.',
            ],
            'en' => [
                'name' => 'Durable Iron Pants',
                'description' => 'Autem quis laudantium odit sed repellat aut. Deleniti ratione itaque quaerat eum vel alias. Esse dicta odit facilis eius.',
            ],
        ],
        [
            'de' => [
                'name' => 'Herrlich Marmor Brieftasche',
                'description' => 'Delectus labore sit alias voluptas. Quo doloribus quod mollitia deleniti laboriosam. Culpa laudantium nulla accusamus id qui ut. A omnis voluptatem omnis qui.',
            ],
            'en' => [
                'name' => 'Gorgeous Marble Wallet',
                'description' => 'Neque dolores qui ut officiis explicabo voluptatum qui. Fugit tenetur id sapiente esse aut eligendi et facere. Sed quos quia molestiae odit.',
            ],
        ],
        [
            'de' => [
                'name' => 'Dauerhaft Aluminium Bank',
                'description' => 'Facere architecto ullam aut. Sapiente qui mollitia minus iure omnis impedit praesentium. Debitis ea vero est doloribus laboriosam ex tempora. Natus odio ipsam magni voluptas id voluptatibus.',
            ],
            'en' => [
                'name' => 'Durable Aluminum Bench',
                'description' => 'Aut perspiciatis occaecati dolores quia nostrum sint. Harum natus est saepe laboriosam accusamus dolorem.',
            ],
        ],
        [
            'de' => [
                'name' => "Intelligent H\u00f6lzern Computer",
                'description' => 'Nobis modi aspernatur non id esse accusantium. Qui impedit delectus quia eum eligendi quas.',
            ],
            'en' => [
                'name' => 'Intelligent Wooden Computer',
                'description' => 'Ab sunt est voluptatibus veniam. Est possimus quia fugiat id perferendis repellat non soluta. Eaque sequi velit sint ipsum.',
            ],
        ],
        [
            'de' => [
                'name' => 'Dauerhaft Leder Computer',
                'description' => 'Earum laudantium voluptates culpa ut delectus est doloribus dolores. Ullam iure et iure impedit voluptate sit error.',
            ],
            'en' => [
                'name' => 'Durable Leather Computer',
                'description' => 'Corporis quibusdam autem necessitatibus dolorem unde totam cum temporibus. Ipsa quam qui et asperiores autem quam consequatur. Est eos dolores est laboriosam sit.',
            ],
        ],
        [
            'de' => [
                'name' => 'Ergonomisch Baumwolle Wagen',
                'description' => 'Consectetur labore est consectetur beatae cumque dignissimos. Velit tenetur error maiores et veniam. Quia impedit quasi doloribus quos omnis delectus sit quia.',
            ],
            'en' => [
                'name' => 'Ergonomic Cotton Car',
                'description' => 'Voluptatem quos eaque esse doloremque. Neque rerum eum mollitia nam. Quo facere vitae et odio molestiae.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Aluminium Uhr',
                'description' => 'Magnam natus non eos optio perspiciatis nisi. Nihil voluptates et iste eius vel possimus. Quasi fugit fugiat illum labore debitis. Quae possimus provident non recusandae sint.',
            ],
            'en' => [
                'name' => 'Aerodynamic Aluminum Clock',
                'description' => 'Beatae voluptatem quisquam aut omnis perspiciatis. Maiores ut et omnis et est. Nostrum dolorum molestias perspiciatis porro sit porro perspiciatis.',
            ],
        ],
        [
            'de' => [
                'name' => "Enorm H\u00f6lzern Mantel",
                'description' => 'Temporibus consequuntur vero debitis omnis numquam est. Qui et blanditiis perferendis facere eaque sapiente voluptas. Sed iste tempora nulla minus ipsa.',
            ],
            'en' => [
                'name' => 'Enormous Wooden Coat',
                'description' => 'Cumque voluptas nemo voluptatem non ut repudiandae esse. Doloribus molestiae laudantium quidem voluptas. Et numquam suscipit aliquid nihil enim corrupti.',
            ],
        ],
        [
            'de' => [
                'name' => "Mittelm\u00e4\u00dfig Marmor Uhr",
                'description' => 'Culpa et dolor qui recusandae sint deserunt dolorem. Mollitia qui nisi dolores earum pariatur quo. Sint eligendi accusamus eius in.',
            ],
            'en' => [
                'name' => 'Mediocre Marble Watch',
                'description' => 'Sed odio autem inventore sint. Est temporibus minima odit et nulla ipsam et molestias. Quas ut et dolore et officiis ullam.',
            ],
        ],
        [
            'de' => [
                'name' => 'Glatt Papier Wagen',
                'description' => 'Hic perferendis et sunt consequatur. Corrupti est quo eum sunt aut aut. Quia provident doloribus aliquid vero quod adipisci molestias minima.',
            ],
            'en' => [
                'name' => 'Sleek Paper Car',
                'description' => 'Quis rerum eligendi dolor neque. A commodi illum consequuntur. Repellendus aliquam molestias et expedita quia.',
            ],
        ],
        [
            'de' => [
                'name' => 'Unglaublich Aluminium Hut',
                'description' => 'Incidunt laudantium reiciendis et consequuntur officiis. Iste sint consequatur rem qui qui officia. Voluptas et dolorem quia omnis est officiis voluptates.',
            ],
            'en' => [
                'name' => 'Incredible Aluminum Hat',
                'description' => 'Ut itaque alias aspernatur aliquam. Dolor ullam porro magni doloribus corporis illo molestiae. Aliquam est possimus nihil eos reiciendis ex. Laborum harum tempora et autem possimus aut eum id.',
            ],
        ],
        [
            'de' => [
                'name' => 'Ergonomisch Eisen Lampe',
                'description' => 'Et qui soluta et velit et iste. Sapiente ut pariatur neque tempore libero placeat. Adipisci dolor consequatur architecto ut in optio. Voluptatem numquam id suscipit eum consequuntur voluptatem.',
            ],
            'en' => [
                'name' => 'Ergonomic Iron Lamp',
                'description' => 'Ipsum consectetur aut perspiciatis eum. Nulla at id eveniet ipsa sapiente. Dicta temporibus enim in fugit quia qui molestias. Id aut rem omnis similique at est fugiat fuga.',
            ],
        ],
        [
            'de' => [
                'name' => "Intelligent H\u00f6lzern Handschuhe",
                'description' => 'Veritatis quia unde ab omnis est dolorem qui beatae. Expedita sit qui eveniet aliquid. Officiis cumque similique nulla perspiciatis. Quaerat exercitationem rerum cumque consequuntur et quasi.',
            ],
            'en' => [
                'name' => 'Intelligent Wooden Gloves',
                'description' => 'Cumque ex voluptatem fugit esse. Et illo enim odit. Minima sit molestiae autem omnis soluta. Commodi vitae porro dolor nemo.',
            ],
        ],
        [
            'de' => [
                'name' => 'Klein Papier Hemd',
                'description' => 'Ratione quia eum cum esse non et. Asperiores ratione pariatur adipisci in laudantium. Quos est quia dicta velit soluta quidem. Recusandae qui nisi in deserunt non.',
            ],
            'en' => [
                'name' => 'Small Paper Shirt',
                'description' => 'Esse nemo maiores ea deserunt ut quasi. Ut similique voluptatum sit accusamus. Reiciendis sint hic ut consequatur dolorem. Voluptates tempore placeat optio quia soluta expedita repellat.',
            ],
        ],
        [
            'de' => [
                'name' => 'Genial Gummi Uhr',
                'description' => 'Omnis blanditiis itaque ipsa ut. Eum rerum magni facere non laudantium recusandae dolorem. Ipsa illo voluptatem quis.',
            ],
            'en' => [
                'name' => 'Awesome Rubber Watch',
                'description' => 'Sint voluptatem accusamus inventore repellendus voluptatem nam. Aspernatur sit veritatis beatae et. Praesentium perspiciatis sunt quia eum sed nesciunt. Eaque beatae quibusdam sit natus.',
            ],
        ],
        [
            'de' => [
                'name' => 'Synergistisch Bronze Flasche',
                'description' => 'Tempora atque sint ipsa vero et quidem quis. Quia asperiores veritatis optio. Ea est sed quia placeat culpa labore doloribus.',
            ],
            'en' => [
                'name' => 'Synergistic Bronze Bottle',
                'description' => 'Et repellat eveniet fuga veniam. Similique magnam quod unde velit perspiciatis. Aspernatur ea iure aut quas id velit. Atque eaque consectetur et non aliquid repellat sunt.',
            ],
        ],
        [
            'de' => [
                'name' => 'Fantastisch Baumwolle Messer',
                'description' => 'Pariatur nesciunt sint voluptatem. Itaque non cumque voluptas ea rerum quibusdam vel. Quo dolor rem nobis cum. Blanditiis temporibus ad eos quasi.',
            ],
            'en' => [
                'name' => 'Fantastic Cotton Knife',
                'description' => 'Praesentium sunt qui nihil laboriosam rerum. Quis et nemo dolor ipsa. Sapiente quasi aut provident voluptas qui ipsam quae ut. Quo ducimus est dolorum ratione eos.',
            ],
        ],
        [
            'de' => [
                'name' => 'Dauerhaft Aluminium Stuhl',
                'description' => 'Ea sequi tenetur aut quasi necessitatibus nemo. Qui sequi ut ducimus officiis quae. Eos sit accusamus modi eligendi id ut id sint.',
            ],
            'en' => [
                'name' => 'Durable Aluminum Chair',
                'description' => 'Quibusdam distinctio exercitationem nobis corrupti et eius. Rem commodi enim qui commodi. Laboriosam quis vel dolorem adipisci. Rerum incidunt earum omnis quia. Laudantium in necessitatibus illum.',
            ],
        ],
        [
            'de' => [
                'name' => 'Dauerhaft Kupfer Computer',
                'description' => 'Perspiciatis rerum aut eos quibusdam distinctio aut. Corrupti fugiat animi a eos non quia quisquam. Dolorem consequuntur et sit ut.',
            ],
            'en' => [
                'name' => 'Durable Copper Computer',
                'description' => 'Quia ut nihil ipsum quo sint vel. Nemo nemo sit illum eum accusamus molestias dolor autem.',
            ],
        ],
        [
            'de' => [
                'name' => 'Leicht Stahl Computer',
                'description' => 'Tempore expedita beatae at adipisci. Quam qui aut blanditiis iure exercitationem et.',
            ],
            'en' => [
                'name' => 'Lightweight Steel Computer',
                'description' => 'Mollitia tenetur iure error soluta adipisci vitae praesentium. Iure minus veritatis sed doloremque ut maiores necessitatibus. Quia non id possimus eum reprehenderit.',
            ],
        ],
        [
            'de' => [
                'name' => 'Genial Marmor Uhr',
                'description' => 'Deserunt a molestiae hic itaque est cumque. Iusto aspernatur atque laborum doloribus. Rerum repudiandae quidem sit et blanditiis odio velit.',
            ],
            'en' => [
                'name' => 'Awesome Marble Clock',
                'description' => 'Et esse dolores aliquid suscipit autem. Repudiandae laborum sapiente odio excepturi voluptatem temporibus. Quia vel sed quia dolorem. Vel ut ut reprehenderit accusamus dolorum ducimus numquam.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Leinen Brieftasche',
                'description' => 'Tenetur dolor est iusto voluptatem. Praesentium explicabo occaecati asperiores et. Eligendi aperiam qui sapiente corporis quia. Velit aut dolore repellat officia ipsum.',
            ],
            'en' => [
                'name' => 'Aerodynamic Linen Wallet',
                'description' => 'Voluptatem rem et sunt dicta esse. Dolorem reprehenderit iusto velit vel suscipit deserunt aut. Neque eum beatae assumenda. Labore omnis vero sed exercitationem in.',
            ],
        ],
        [
            'de' => [
                'name' => 'Unglaublich Leinen Schuhe',
                'description' => 'Vel consequuntur dolor laborum non. Et alias architecto ut iure repellat laudantium dolorum. Quo consequuntur eos corporis vel. Saepe dolor minus nesciunt. Ut ducimus fugit a.',
            ],
            'en' => [
                'name' => 'Incredible Linen Shoes',
                'description' => 'Quidem tenetur ullam rerum quia et totam. Dolorum sed ut sit ex molestiae ut sit molestiae. Repudiandae velit illo dicta fugit vel necessitatibus.',
            ],
        ],
        [
            'de' => [
                'name' => "Schwerlast H\u00f6lzern Mantel",
                'description' => 'Nostrum aperiam adipisci debitis ut in error. Dolore nulla sunt sint dolor modi. Atque in facilis mollitia. Mollitia praesentium sit ea.',
            ],
            'en' => [
                'name' => 'Heavy Duty Wooden Coat',
                'description' => 'Sed non voluptatem alias vitae. Voluptatibus corrupti voluptate perferendis iure ut voluptatem aut iusto. Rerum quia deleniti fugiat in vero.',
            ],
        ],
        [
            'de' => [
                'name' => 'Klein Papier Hose',
                'description' => 'Ut pariatur et voluptatem fugit. Vitae rerum ut sapiente dolorem. Quaerat ullam libero est. Qui quidem vel et totam. Et distinctio autem perferendis.',
            ],
            'en' => [
                'name' => 'Small Paper Pants',
                'description' => 'Ut officiis et voluptas similique. Eligendi modi expedita quis corrupti. Nemo itaque voluptas possimus nesciunt quia. Et nihil animi quo enim velit aut nemo.',
            ],
        ],
        [
            'de' => [
                'name' => 'Aerodynamisch Die Seide Brieftasche',
                'description' => 'Unde perferendis aperiam nihil. Necessitatibus perferendis nihil ut quo voluptatem. A laborum sed neque. Corrupti blanditiis architecto ratione numquam aut dolorem laudantium quo.',
            ],
            'en' => [
                'name' => 'Aerodynamic Silk Wallet',
                'description' => 'Sit eligendi totam sunt laudantium libero consectetur. Et error et veniam ea culpa provident pariatur.',
            ],
        ],
    ];

    public function __construct(
        protected int $decimalFactor,
        protected StoreRepositoryInterface $storeRepository,
        protected KernelInterface $kernel,
        protected CategoryRepositoryInterface $categoryRepository,
        protected FactoryInterface $productFactory,
        protected ObjectServiceInterface $objectService,
        protected ProductRepositoryInterface $productRepository,
        protected RepositoryInterface $attributeGroupRepository,
        protected RepositoryInterface $attributeColorRepository,
        protected RepositoryInterface $attributeValueRepository,
        protected FactoryInterface $productUnitDefinitionFactory,
        protected FactoryInterface $productUnitDefinitionsFactory,
        protected FactoryInterface $productUnitDefinitionPriceFactory,
        protected FactoryInterface $storeValuesFactory,
    ) {
    }

    public function getDependencies(): array
    {
        return [
            CategoryFixture::class,
            TaxRuleGroupFixture::class,
        ];
    }

    protected function createProduct(string $parentPath): ProductInterface
    {
        $index = array_rand(static::$names);
        $name = static::$names[$index];

        unset(static::$names[$index]);

        $faker = Factory::create();
        $faker->addProvider(new Lorem($faker));
        $faker->addProvider(new Barcode($faker));

        $decimalFactor = $this->decimalFactor;

        $defaultStore = $this->storeRepository->findStandard()->getId();
        $stores = $this->storeRepository->findAll();
        $categories = $this->categoryRepository->findAll();

        /**
         * @var CategoryInterface $usedCategory
         */
        $usedCategory = $categories[random_int(0, count($categories) - 1)];
        $folder = \Pimcore\Model\Asset\Service::createFolderByPath(
            sprintf(
                '/demo/%s/%s',
                $parentPath,
                Service::getValidKey($usedCategory->getName(), 'asset'),
            ),
        );

        $images = [];

        for ($j = 0; $j < 3; ++$j) {
            $imagePath = $this->kernel->locateResource(
                sprintf(
                    '@CoreShopCoreBundle/Resources/fixtures/image%s.jpeg',
                    random_int(1, 3),
                ),
            );

            $fileName = sprintf('image_%s.jpg', uniqid('', true));
            $fullPath = $folder->getFullPath() . '/' . $fileName;

            $existingImage = Asset::getByPath($fullPath);

            if ($existingImage instanceof Asset) {
                $existingImage->delete();
            }

            $image = new \Pimcore\Model\Asset\Image();
            $image->setData(file_get_contents($imagePath));
            $image->setParent($folder);
            $image->setFilename($fileName);
            $image->setFilename(\Pimcore\Model\Asset\Service::getUniqueKey($image));
            $image->save();

            $images[] = $image;
        }

        /**
         * @var ProductInterface $product
         */
        $product = $this->productFactory->createNew();
        foreach (Tool::getValidLanguages() as $language) {
            $product->setName($name[$language]['name'] ?? $name['en']['name'], $language);

            $product->setShortDescription($name[$language]['description'] ?? $name['en']['description'], $language);
            $product->setDescription(implode('<br/>', $faker->paragraphs(3)), $language);
        }
        $product->setSku($faker->ean13);
        $product->setEan($faker->ean13);
        $product->setActive(true);
        $product->setCategories([$usedCategory]);
        $product->setOnHand(10);
//        $product->setWholesalePrice((int)($faker->randomFloat(2, 100, 200) * $decimalFactor));

        foreach ($stores as $store) {
            $product->setStoreValuesOfType('price', (int) ($faker->randomFloat(2, 200, 400) * $decimalFactor), $store);
            $product->setStoreValuesOfType('taxRule', $this->getReference('taxRule'), $store);
        }

        $product->setWidth($faker->numberBetween(5, 10));
        $product->setHeight($faker->numberBetween(5, 10));
        $product->setDepth($faker->numberBetween(5, 10));
        $product->setWeight($faker->numberBetween(5, 10));
        $product->setImages($images);
        $product->setStores([$defaultStore]);
        $product->setParent(
            $this->objectService->createFolderByPath(
                sprintf(
                    '/demo/%s/%s',
                    $parentPath,
                    Service::getValidKey($usedCategory->getName(), 'object'),
                ),
            ),
        );
        $product->setPublished(true);
        $product->setKey($product->getName());
        $product->setKey(Service::getUniqueKey($product));

        return $product;
    }
}
