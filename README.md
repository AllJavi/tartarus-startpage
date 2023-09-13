<div align="center">
    <img src="/img/README-decorator.png" width=300/><br/>
    <a href="https://github.com/AllJavi/tartarus-startpage/stargazers">
        <img src="https://img.shields.io/github/stars/AllJavi/tartarus-startpage?color=a9b665&style=for-the-badge&logo=starship">
    </a>
    <a href="https://github.com/AllJavi/tartarus-startpage/issues">
        <img src="https://img.shields.io/github/issues/AllJavi/tartarus-startpage?color=ea6962&style=for-the-badge&logo=codecov">
    </a>
    <a href="https://github.com/AllJavi/tartarus-startpage/network/members">
        <img src="https://img.shields.io/github/forks/AllJavi/tartarus-startpage?color=7daea3&style=for-the-badge&logo=jfrog-bintray">
    </a>
    <a href="https://github.com/AllJavi/tartarus-startpage/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-orange.svg?color=d4be98&style=for-the-badge&logo=archlinux">
    </a>
</div>

## 💻 Preview

https://github.com/AllJavi/tartarus-startpage/assets/49349604/9a2a3f4c-33ef-4eb3-9243-cc160a56a181

This start page is based on the [dawn](https://github.com/b-coimbra/dawn) repository, which has even more functionality. I've tweaked the page's style a bit to match my [dotfiles](https://github.com/AllJavi/tartarus-dotfiles), and I've added some features to make it more comfortable.

## ⌨️ Keybindings
| Hotkey                                            | Action                      |
| ------------------------------------------------- | --------------------------- |
| <kbd>Numrow</kbd> \| <kbd>MouseWheel</kbd> \| <kbd>Click</kbd> | Switch tabs            |
| <kbd>s</kbd>                           | Search Dialog            |
| <kbd>q</kbd>                           | Config Dialog (new)           |
| <kbd>Esc</kbd>                           | Close Dialogs            |

## ⚙️ Configuration Dialog
![config-dialog](https://github.com/AllJavi/tartarus-startpage/assets/49349604/3b42c650-b5bb-4a7d-a358-cfa5a8915966)

The default configuration file is [userconfig.js](userconfig.js), but you can change it in the configuration dialog. You can find more information about how the file works in the [original repository](https://github.com/b-coimbra/dawn). The available components are tabs, a clock, and weather.

Additionally, there are two different new options:
- `fastlink`: To set the link of the Pokeball button.
- `localIcons`: To optimize the loading time of the icons, you can check it out [here](#local-icons).

## 🔍 Search Dialog
![search-dialog](https://github.com/AllJavi/tartarus-startpage/assets/49349604/3f76323d-88c4-41b6-b93d-e4cceb1780b7)

The search dialog allows you to display a search bar with various search engines defined in the configuration. To select each one, you simply need to prefix the query with the corresponding `!<id>`.
By default, the defined search engines are:
- `!g`: google
- `!d`: duckduckgo
- `!y`: youtube
- `!r`: reddit
- `!p`: pinterest

## 🖼 Available banners
|cbg-2|cbg-3|cbg-4|cbg-5|
| ------------- | ------------- | ------------- | ------------- | 
|<img src="src/img/banners/cbg-2.gif" width=175>|<img src="src/img/banners/cbg-3.gif" width=175>|<img src="src/img/banners/cbg-4.gif" width=175>|<img src="src/img/banners/cbg-5.gif" width=175>|

|cbg-6|cbg-7|cbg-8|cbg-9|
| ------------- | ------------- | ------------- | ------------- |
|<img src="src/img/banners/cbg-6.gif" width=175>|<img src="src/img/banners/cbg-7.gif" width=175>|<img src="src/img/banners/cbg-8.gif" width=175>|<img src="src/img/banners/cbg-9.gif" width=175>|

|cbg-10|cbg-11|cbg-12|cbg-13|
| ------------- | ------------- | ------------- | ------------- |
|<img src="src/img/banners/cbg-10.gif" width=175>|<img src="src/img/banners/cbg-11.gif" width=175>|<img src="src/img/banners/cbg-12.gif" width=175>|<img src="src/img/banners/cbg-13.gif" width=175>|

## Local Icons
If you want to reduce the loading time of the icons, you could install the [icon font](https://github.com/AllJavi/tartarus-startpage/tree/master/src/fonts) locally and activate the option `"localIcons": true` in the config to disable the remote styles.

## Credit
- [Dawn Startpage](https://github.com/b-coimbra/dawn) ([preview](https://startpage.metaphoric.dev/))

## License
[MIT License](./LICENSE)
