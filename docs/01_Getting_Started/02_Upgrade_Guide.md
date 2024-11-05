# Upgrade Guide

Please check the [Upgrade_Notes](02_Upgrade_Notes.md) Guide for changes and for potential breaking changes.

We follow similar approach to updates as Pimcore does. So always update to the latest Minor release version first before 
updating to the next Major release version. This means that if you are on 3.2.1 and want to update to 4.0, you should update
to the latest 3.2.x release first and then update to 4.0 or 4.1.

## Migration Files
To keep things tidy, we remove migration between major versions. This means that if you are on 3.2.1 and you update to 4.0
directly, you might miss migrations. Always update to the latest Minor release version first before updating to the next Major!

This also means that if you do major updates, you will have old migrations in your Database. You can manually remove those
if you want to keep your Migrations Table clean.

If you already updated the major version and recognize that some migrations from your previous version to latest minor release version are missing, you can compare the database structure via
`bin/console doctrine:schema:update --dump-sql`
Please manually review the SQL statements before executing
