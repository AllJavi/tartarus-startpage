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

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (16+)

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/AllJavi/tartarus-startpage.git
cd tartarus-startpage

# Install Node.js dependencies
npm install

# Start the proxy server (for API calls)
npm start
# or
node proxy-server.js
```

### Proxy Server (Required for Weather & Search Suggestions)
The proxy server enables:
- Weather API calls without CORS issues
- Google search suggestions
- Seamless API integration

**Keep it running in the background while using the startpage.**

This start page is based on the [dawn](https://github.com/b-coimbra/dawn) repository, which has even more functionality. I've tweaked the page's style a bit to match my [dotfiles](https://github.com/AllJavi/tartarus-dotfiles), and I've added some features to make it more comfortable.

## 🎨 Iconify Multi-Source System

**Tartarus** now uses **Iconify** for unlimited icon access:
- **100,000+ icons** from **100+ collections** (Tabler, FontAwesome, Material, etc.)
- **Unified API**: Same syntax for all icon sources
- **CDN/Local loading**: Zero-config switching
- **Automatic fallbacks**: Graceful handling of missing icons

### Usage Examples
```javascript
// Default Tabler icons (backward compatible)
{ icon: "brand-github", icon_color: "#333" }

// FontAwesome icons
{ icon: "github", icon_source: "fa-brands", icon_color: "#333" }

// Material Design icons
{ icon: "home", icon_source: "ic", icon_color: "#333" }

// Any collection: tabler, fa6, lucide, heroicons, etc.
{ icon: "icon-name", icon_source: "collection-name", icon_color: "#333" }
```

**Performance**: +~22KB total, +~8KB gzipped. Icons load on-demand.

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

## 🏠 Local Icons (Legacy)

**Note**: Previous versions used local Tabler icon fonts. The new **Iconify system** automatically handles CDN/local optimization.

If you prefer local-only operation, Iconify supports self-hosting selected icon collections. However, the CDN approach provides better performance and instant access to all collections.

### Migration from Legacy Icons
-existing Tabler icons work unchanged
- Add `icon_source: "tabler"` for explicit source specification
- No font files needed - Iconify handles everything

## Credit
- [Dawn Startpage](https://github.com/b-coimbra/dawn) ([preview](https://startpage.metaphoric.dev/))

## License
[MIT License](./LICENSE)
