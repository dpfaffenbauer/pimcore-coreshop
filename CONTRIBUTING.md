# Contributing to CoreShop

## Bug Reports & Feature Requests
The CoreShop team heavily uses (and loves!) GitHub for all of our software management. 
We use GitHub issues exclusively to track all bugs and features.

* [Open an issue](https://github.com/coreshop/CoreShop/issues) here on GitHub. 
If you can, **please provide a fix and create a pull request (PR) instead**; this will automatically create an issue for you.
* Report security issues only to info@coreshop.com 
* Please be patient as not all items will be tested immediately - remember, CoreShop is open source and free of charge. 
* Occasionally we'll close issues if they appear stale or are too vague - please don't take this personally! 
Please feel free to re-open issues we've closed if there's something we've missed and they still need to be addressed.

## Contributing Pull Requests
PR's are even better than issues. 
We gladly accept community pull requests. 
There are a few necessary steps before we can accept a pull request:

* [Open an issue](https://github.com/coreshop/CoreShop/issues) describing the problem that you are looking to solve in 
your PR (if one is not already open), and your approach to solving it (not necessary for bug fixes - only for feature contributions). 
* [Fork us!](https://help.github.com/articles/fork-a-repo/) Code! Follow the coding standards PSR-1 and PSR-2
* [Send a pull request](https://help.github.com/articles/using-pull-requests/) from your fork’s branch to our `master` branch.

## Set up local development environment
This guide outlines the steps to set up CoreShop for development on your local machine.
### Prerequisites:
* Docker Desktop: Ensure you have Docker Desktop installed and running on your system. You can find download and installation instructions for Windows, Mac and Linux here: https://docs.docker.com/desktop/ or
* OrbStack (macOS only): Ensure you have OrbStack installed on your system. You can find download and installation instructions here: https://orbstack.dev/

### Step 1: Build docker images
Navigate to the cloned CoreShop directory in your terminal, and run the following command to build the Docker images:

```shell
docker compose build --build-arg uid=$(id -u) --pull
```

### Step 2: Full Install
Run the following command to install Pimcore and CoreShop:
```shell
docker compose run --rm php bin/install
````

#### Step 3: Handle permissions
```shell
docker compose run --rm php chown www-data:www-data public/var/* var/*
```
For Linux Native systems we also need to execute:
```shell
sudo chown -R $(id -u):$(id -g)
```

### Manual Installation
Optionally you can run the single steps:

#### Step 1: Install Dependencies 
Navigate to the cloned CoreShop directory in your terminal.

Run the following command to install all the required dependencies using Composer:
```shell
docker compose run --rm php composer install
```

#### Step 2: Install Pimcore
Run the following command to install Pimcore using the provided Docker image:
```shell
docker compose run --rm php vendor/bin/pimcore-install --no-interaction --ignore-existing-config
```

#### Step 3: Install CoreShop
Run the following command to install CoreShop:
```shell
docker compose run --rm php bin/console coreshop:install
```

#### Step 4: Install Demo Data (Optional)
CoreShop offers a demo dataset for testing purposes. To install the demo data, run the following command:
```shell
docker compose run --rm php bin/console coreshop:install:demo
```

## Running Code Analysis
CoreShop provides options for running code analysis tools like Psalm and PHPStan. These tools help identify potential errors and improve code quality.
Run the following command to execute Psalm within a Docker container:

```shell
docker compose run --rm php vendor/bin/psalm
```

Run the following command to run PHPStan with specific configuration options:
```shell
docker compose run --env SYMFONY_ENV=test --rm php vendor/bin/phpstan analyse -c phpstan.neon src -l 3 --memory-limit=-1
```

## Running Tests

Setup the behat container first by building the image and installing the dependencies:

```shell
docker compose build --build-arg behat
```

### BEHAT Domain

Run the following command to execute the domain tests:

```shell
docker compose run --rm behat vendor/bin/behat -c behat.yml.dist -p default
```

### BEHAT UI

UI tests require a running coreshop instance and a browser. Use the following command to run the UI tests
in a container:

```shell
docker compose run --rm behat
```

### Contributor License Agreement
The following terms are used throughout this agreement:

* **You** - the person or legal entity including its affiliates asked to accept this agreement. An affiliate is any 
entity that controls or is controlled by the legal entity, or is under common control with it.

* **Project** - is an umbrella term that refers to any and all CoreShop projects.

* **Contribution** - any type of work that is submitted to a Project, including any modifications or additions to 
existing work.

* **Submitted** - conveyed to a Project via a pull request, commit, issue, or any form of electronic, written, or 
verbal communication with CoreShop, contributors or maintainers.

#### 1. Grant of Copyright License.
Subject to the terms and conditions of this agreement, You grant to the Projects’ maintainers, contributors, users and 
to CoreShop a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, 
prepare derivative works of, publicly display, publicly perform, sublicense, and distribute Your contributions and such 
derivative works. Except for this license, You reserve all rights, title, and interest in your contributions.

#### 2. Grant of Patent License.
Subject to the terms and conditions of this agreement, You grant to the Projects’ maintainers, contributors, users and 
to CoreShop a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) 
patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer your contributions, where 
such license applies only to those patent claims licensable by you that are necessarily infringed by your contribution 
or by combination of your contribution with the project to which this contribution was submitted. 

If any entity institutes patent litigation - including cross-claim or counterclaim in a lawsuit - against You alleging 
that your contribution or any project it was submitted to constitutes or is responsible for direct or contributory 
patent infringement, then any patent licenses granted to that entity under this agreement shall terminate as of the 
date such litigation is filed.

#### 3. Source of Contribution.
Your contribution is either your original creation, based upon previous work that, to the best of your knowledge, is 
covered under an appropriate open source license and you have the right under that license to submit that work with 
modifications, whether created in whole or in part by you, or you have clearly identified the source of the contribution 
and any license or other restriction (like related patents, trademarks, and license agreements) of which you are 
personally aware.
