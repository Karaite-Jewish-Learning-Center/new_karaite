### Objective: Being able to use docker or Conda locally using the same .env file.

#### Direnv installation

```bash
brew install direnv
```

#### Direnv setup

```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```
#### configure direnv to use .env file not the .envrc file

#### Create a .config folder in your home directory

```bash
mkdir ~/.config
```
#### create a direnv folder in the .config folder

```bash
mkdir ~/.config/direnv
```

#### create a config file in the direnv folder

```bash
touch ~/.config/direnv/direnv.toml

```

#### Add the following to the direnv.toml file

```toml 
[global]
load_dotenv = true
```