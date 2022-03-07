# `clock.chriscarini.com`

This repository is the backing to [clock.chriscarini.com](https://clock.chriscarini.com).

### Development Notes

#### git Submodules

This repository makes use of git submodules. Specifically, we
use [simple-php-git-deploy](https://github.com/markomarkovic/simple-php-git-deploy)
to automatically deploy changes to this repository to our host.

When cloning this directory, run the below command to automatically initialize and update the submodules:

```bash
git clone --recurse-submodules git@github.com:ChrisCarini/clock.chriscarini.com.git
```

You will have to create the `deploy-config.php` file and set the properties accordingly.

```bash
cp deploy-hooks/deploy-config.example.php deploy-hooks/deploy-config.php
vi deploy-hooks/deploy-config.php
```

(**Note:** We explicitly exclude this file from SCM, so you will have to SCP it over to the host.)

See [git-scm.com - 7.11 Git Tools - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) for a good primer
on git submodules. 