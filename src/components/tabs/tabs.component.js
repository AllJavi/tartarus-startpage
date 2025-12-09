class Links extends Component {
  constructor() {
    super();
  }

  static getIcon(link) {
    const defaultColor = "#726f6f";

    if (link.icon) {
      try {
        // Convert icon name from camelCase to kebab-case for Iconify
        const normalizedIcon = link.icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const iconSource = link.icon_source || 'tabler';
        const iconAttr = `${iconSource}:${normalizedIcon}`;

        // Basic validation - ensure icon name doesn't contain dangerous chars
        if (!/^[a-zA-Z0-9\-_:]+$/.test(iconAttr)) {
          console.warn(`Invalid icon name: ${iconAttr}`);
          return this.getFallbackIcon(link, defaultColor);
        }

        return `<iconify-icon
                icon="${iconAttr}"
                class="link-icon"
                style="color: ${link.icon_color ?? defaultColor}; font-size: 27px;"
                onerror="this.style.display='none'; console.warn('Icon failed to load:', '${iconAttr}')">
               </iconify-icon>`;
      } catch (error) {
        console.error('Error rendering icon:', error);
        return this.getFallbackIcon(link, defaultColor);
      }
    }
    return "";
  }

  static getFallbackIcon(link, defaultColor) {
    // Fallback to a simple text icon if web component fails
    return `<span class="link-icon-fallback"
            style="color: ${link.icon_color ?? defaultColor}; font-size: 24px; display: inline-block;">
            ${link.name ? link.name.charAt(0).toUpperCase() : '•'}
           </span>`;
  }

  static getAll(tabName, tabs) {
    const { categories } = tabs.find((f) => f.name === tabName);

    return `
      ${categories.map(({ name, links }) => {
      return `
          <li>
            <h1>${name}</h1>
              <div class="links-wrapper">
              ${links.map((link) => `
                  <div class="link-info">
                    <a href="${link.url}">
                      ${Links.getIcon(link)}
                      ${link.name ? `<p class="link-name">${link.name}</p>` : ""
        }
                    </a>
                </div>`).join("")
        }
            </div>
          </li>`;
    }).join("")
      }
    `;
  }
}

class Category extends Component {
  constructor() {
    super();
  }

  static getBackgroundStyle(url) {
    return `style="background-image: url(${url}); background-repeat: no-repeat;background-size: contain;"`;
  }

  static getAll(tabs) {
    return `
      ${tabs.map(({ name, background_url }, index) => {
      return `<ul class="${name}" ${Category.getBackgroundStyle(background_url)
        } ${index == 0 ? "active" : ""}>
            <div class="banner"></div>
            <div class="category-label" data-tab-index="${index}">${name}</div>
            <div class="links">${Links.getAll(name, tabs)}</div>
          </ul>`;
    }).join("")
      }
    `;
  }
}

class Tabs extends Component {
  refs = {};

  constructor() {
    super();
    this.tabs = CONFIG.tabs;
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.fonts.raleway,
      this.resources.libs.awoo,
    ];
  }

  style() {
    return `
      status-bar {
          bottom: 0px;
          height: 32px;
          background: #282828;
          box-shadow: 0 10px 20px rgba(0, 0, 0, .25);
      }

      #panels, #panels ul,
      #panels .links {
          position: absolute;
      }

      .nav {
          color: #fff;
      }

      #panels {
          border-radius: 15px;
          width: 90%;
          max-width: 100vw;
          height: 85% !important;
          max-height: 100vh;
          overflow: hidden;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
          margin: 5vh auto;
          box-shadow: 0 5px 10px rgba(0, 0, 0, .2);
          background: #282828;
          display: flex;
          position: absolute;
      }

      .categories {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
          border-radius: 10px 0 0 10px;
      }

      task-list {
        width: 30%;
        height: 100%;
        border-left: 1px solid #444;
      }

      .categories ul {
          --panelbg: transparent;
          --flavour: var(--accent);
          width: 100%;
          height: 100%;
          position: absolute;
          display: none;
          background: #282828 url("../img/bg-1.gif") repeat left;
	        transition: all .6s;
	        # animation: scroll 25s ease-in-out infinite;
      }

      @keyframes scroll {
          50% {
              background-position-x: -240px;
          }
      }

      .categories ul:nth-child(2) {
          --flavour: #e78a4e;
      }

      .categories ul:nth-child(3) {
          --flavour: #ea6962;
      }

      .categories ul:nth-child(4) {
          --flavour: #7daea3;
      }

      .categories ul:nth-child(5) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(6) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(7) {
          --flavour: #a9b665;
      }

      .categories ul:nth-child(8) {
          --flavour: #e78a4e;
      }

      .categories ul:nth-child(9) {
          --flavour: #ea6962;
      }

      .categories ul:nth-child(10) {
          --flavour: #7daea3;
      }

      .categories ul:nth-child(11) {
          --flavour: #d3869b;
      }

      .categories ul:nth-child(12) {
          --flavour: #d3869b;
      }

      .categories ul .links {
          box-shadow: inset -1px 0 var(--flavour);
      }

      .categories ul {
          pointer-events: none;
      }

      .categories ul[active] {
          display: block;
          opacity: 1;
          z-index: 1;
          pointer-events: auto;
      }

      .categories .links {
          right: 0;
          width: 70%;
          height: 100%;
          background: #282828;
          padding: 5%;
          flex-wrap: wrap;
      }

      .categories .links li {
          list-style: none;
      }

      .categories ul .links a {
          color: #d4be98;
          text-decoration: none;
          font: 700 18px 'Roboto', sans-serif;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          padding: .4em .7em;
          background: #32302f;
          box-shadow: 0 4px rgba(50, 48, 47, 0.5), 0 5px 10px rgb(0 0 0 / 20%);
          border-radius: 2px;
          margin-bottom: .7em;
          pointer-events: none;
      }

      .categories ul[active] .links a {
          pointer-events: auto;
      }

      .categories .link-info {
          display: inline-flex;
      }

      .categories .link-info:not(:last-child) { margin-right: .5em; }

      .categories ul .links a:hover {
          transform: translate(0, 4px);
          box-shadow: 0 0 rgba(0, 0, 0, 0.25), 0 0 0 rgba(0, 0, 0, .5), 0 -0px 5px rgba(0, 0, 0, .1);
          color: var(--flavour);
      }

      .category-label {
          position: absolute;
          display: flex;
          text-transform: uppercase;
          overflow-wrap: break-word;
          width: 25px;
          height: 250px;
          padding: 1em;
          margin: auto;
          border-radius: 5px;
          box-shadow: inset 0 0 0 2px var(--flavour);
          left: calc(15% - 42.5px);
          bottom: 0;
          top: 0;
          background: linear-gradient(to top, rgb(50 48 47 / 90%), transparent);
          color: var(--flavour);
          letter-spacing: 1px;
          font: 500 40px 'Nunito', sans-serif;
          text-align: center;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          justify-content: center;
          align-items: center;
          word-break: break-all;
          backdrop-filter: blur(3px);
          cursor: pointer;
          transition: all 0.2s;
      }

      .category-label:hover {
          background: linear-gradient(to top, rgb(50 48 47 / 95%), transparent);
          transform: scale(1.05);
      }

      .categories .links li:not(:last-child) {
          box-shadow: 0 1px 0 rgba(212, 190, 152, .25);
          padding: 0 0 .5em 0;
          margin-bottom: 1.5em;
      }

      .categories .links li h1 {
          color: #d4be98;
	        opacity: 0.5;
          font-size: 13px;
          margin-bottom: 1em;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'Raleway', sans-serif;
      }

      .categories .link-icon {
          font-size: 27px;
          color: #726f6f;
      }

      .categories .link-icon + .link-name {
          margin-left: 10px;
      }

      .categories .links-wrapper {
          display: flex;
          flex-wrap: wrap;
      }

      .link-icon-fallback {
          font-weight: 600;
          font-family: 'Roboto', sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: fadeInAnimation ease .5s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
      }

      .ti {
          animation: fadeInAnimation ease .5s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          height: 27px;
          width: 27px;
      }

      @keyframes fadeInAnimation {
          0% {
              opacity: 0;
          }
          100% {
              opacity: 1;
           }
      }
    `;
  }

  template() {
    return `
      <div id="links" class="-">

        <div id="panels">
          <div class="categories">
            ${Category.getAll(this.tabs)}
            <search-bar></search-bar>
            <config-tab></config-tab>
            </div>
            <task-list></task-list>
            </div>
            </div>
            <status-bar class="!-"></status-bar>
    `;
  }

  connectedCallback() {
    this.render().then(() => {
      this.setupCategoryClickHandlers();
    });
  }

  setupCategoryClickHandlers() {
    const categoryLabels = this.shadowRoot.querySelectorAll('.category-label');

    categoryLabels.forEach((label) => {
      label.addEventListener('click', (event) => {
        const tabIndex = parseInt(event.target.getAttribute('data-tab-index'));
        // Find the status bar and trigger tab change
        const statusBar = document.querySelector('status-bar');
        if (statusBar && statusBar.activateByKey) {
          statusBar.activateByKey(tabIndex);
        }
      });
    });
  }
}
