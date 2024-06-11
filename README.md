# ha-fusion

A modern, easy-to-use and performant custom [Home Assistant](https://www.home-assistant.io/) dashboard

<https://www.youtube.com/watch?v=D8mWruSuPOM>

[![preview](/static/preview.png)](https://www.youtube.com/watch?v=D8mWruSuPOM)

Based on project ❤️ <https://github.com/matt8707/ha-fusion>, but my approach does not align well with the project goals

---

## 📣 Alpha

The current state of this project is **pre-beta**. This means that there's basic functionality missing, incomplete features and unresolved issues. General feedback, bug reports and feature requests are welcome!

---

## Installation

### Docker

If you're using the "Container" or "Core" installation methods, ha-fusion-pro can be installed via Docker:

1. **Docker Compose File**: Place your edited copy of the [docker-compose.yml](https://github.com/bzzim/ha-fusion-pro/blob/main/docker-compose.yml) file in a suitable directory.

2. **Create Container**:
   Run the following commands in your terminal to start the container:

   ```bash
   cd path/to/docker-compose.yml
   docker-compose up -d ha-fusion-pro
   ```

#### Update

To update to the latest version of ha-fusion-pro, run the following commands:

```bash
docker-compose pull ha-fusion-pro
docker-compose up -d ha-fusion-pro
```

<details>
<summary>
   <b>Other</b>
</summary>

Without docker-compose, updating the container involves additional steps. For each update, it's necessary to first stop the current container, remove it, pull the new image, and then execute the docker run command again.

```bash
docker run -d \
  --name ha-fusion-pro \
  --network bridge \
  -p 5050:5050 \
  -v /path/to/ha-fusion-pro:/app/data \
  -e TZ=Asia/Yekaterinburg \
  -e HASS_URL=http://192.168.100.150:8123 \
  --restart always \
  ghcr.io/bzzim/ha-fusion-pro
```

</details>

## Query strings

These will only function if you have exposed a port in the add-on configuration or by using Docker. Note that when using Ingress, query strings cannot be read.

### View

To set a particular view when the page loads, add the "view" parameter. For example, if you have a "Bedroom" view, append the query string `?view=Bedroom` to the URL.

### Menu

To disable the menu button, append the query string `?menu=false` to the URL. This is useful when you want to avoid unwanted changes to your dashboard, such as on wall-mounted tablets.

---

## Keyboard Shortcuts

| Key                 | Description |
| ------------------- | ----------- |
| **f**               | filter      |
| **esc**             | exit        |
| **cmd + s**         | save        |
| **cmd + z**         | undo        |
| **cmd + shift + z** | redo        |

---

## Debug

To debug any errors, check the "Log" tab if you're using the addon, or use `docker logs ha-fusion-pro` for Docker setups. To inspect frontend issues, open the browser's console.

---

## Develop

To begin contributing to the project, you'll first need to install node. It's also recommended to install pnpm. If you're unfamiliar with Svelte, consider doing the tutorial at <https://learn.svelte.dev>

```bash
# prerequisites (macos)
brew install node pnpm

# install
git clone https://github.com/bzzim/ha-fusion-pro.git
cd ha-fusion-pro
pnpm install

# environment
cp .env.example .env
code .env

# server
npm run dev -- --open

# dependencies
pnpm outdated
pnpm upgrade

# lint
npm run check
npm run lint
npm run format
```
