class Statusbar extends Component {
  externalRefs = {};

  refs = {
    categories: ".categories ul",
    tabs: "#tabs ul li",
    indicator: ".indicator",
    fastlink: ".fastlink",
  };

  currentTabIndex = 0;

  constructor() {
    super();

    this.setDependencies();
  }

  setDependencies() {
    this.externalRefs = {
      categories: this.parentNode.querySelectorAll(this.refs.categories),
    };
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material,
      this.resources.libs.awoo,
    ];
  }

  style() {
    return `
      *:not(:defined) { display: none; }

      #tabs,
      #tabs .widgets,
      #tabs ul li:last-child {
          position: absolute;
      }

      #tabs {
          width: 100%;
          height: 100%;
      }

      #tabs ul {
          counter-reset: tabs;
          height: 100%;
          position: relative;
          list-style: none;
          margin-left: 1em;
      }

      #tabs ul li:not(:last-child)::after {
          content: counter(tabs, cjk-ideographic);
          counter-increment: tabs;
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          align-items: center;
          text-align: center;
          justify-content: center;
      }

      #tabs ul li:not(:last-child) {
          width: 35px;
          text-align: center;
          font: 700 13px 'Yu Gothic', serif;
          color: rgba(212, 190, 152, 0.5);
          padding: 6px 0;
          transition: all .1s;
          cursor: pointer;
          line-height: 0;
          height: 100%;
      }

      #tabs ul li:not(:last-child):hover {
          background: #32302f;
      }

      #tabs ul li:last-child {
          --flavour: var(--accent);
          width: 35px;
          height: 3px;
          background: var(--flavour);
          bottom: 0;
          transition: all .3s;
      }

      #tabs ul li[active]:not(:last-child) {
          color: #d4be98;
          font-size: 13px;
          padding: 6px 0;
      }

      #tabs ul li[active]:nth-child(2) ~ li:last-child { margin: 0 0 0 35px; }
      #tabs ul li[active]:nth-child(3) ~ li:last-child { margin: 0 0 0 70px; }
      #tabs ul li[active]:nth-child(4) ~ li:last-child { margin: 0 0 0 105px; }
      #tabs ul li[active]:nth-child(5) ~ li:last-child { margin: 0 0 0 140px; }
      #tabs ul li[active]:nth-child(6) ~ li:last-child { margin: 0 0 0 175px; }
      #tabs ul li[active]:nth-child(7) ~ li:last-child { margin: 0 0 0 210px; }
      #tabs ul li[active]:nth-child(8) ~ li:last-child { margin: 0 0 0 245px; }
      #tabs ul li[active]:nth-child(9) ~ li:last-child { margin: 0 0 0 280px; }
      #tabs ul li[active]:nth-child(10) ~ li:last-child { margin: 0 0 0 315px; }
      #tabs ul li[active]:nth-child(11) ~ li:last-child { margin: 0 0 0 350px; }
      #tabs ul li[active]:nth-child(12) ~ li:last-child { margin: 0 0 0 385px; }

      #tabs ul li[active]:nth-child(2) ~ li:last-child {
          --flavour: #e78a4e;
      }

      #tabs ul li[active]:nth-child(3) ~ li:last-child {
          --flavour: #ea6962;
      }

      #tabs ul li[active]:nth-child(4) ~ li:last-child {
          --flavour: #7daea3;
      }

      #tabs ul li[active]:nth-child(5) ~ li:last-child {
          --flavour: #d3869b;
      }

      #tabs ul li[active]:nth-child(6) ~ li:last-child {
          --flavour: #89b482;
      }

      #tabs ul li[active]:nth-child(7) ~ li:last-child {
          --flavour: #a9b665;
      }

      #tabs ul li[active]:nth-child(8) ~ li:last-child {
          --flavour: #e78a4e;
      }

      #tabs ul li[active]:nth-child(9) ~ li:last-child {
          --flavour: #ea6962;
      }

      #tabs ul li[active]:nth-child(10) ~ li:last-child {
          --flavour: #7daea3;
      }

      #tabs ul li[active]:nth-child(11) ~ li:last-child {
          --flavour: #d3869b;
      }

      #tabs ul li[active]:nth-child(12) ~ li:last-child {
          --flavour: #89b482;
      }

      .widgets {
          right: 0;
          margin: auto;
          height: 32px;
          color: #fff;
          font-size: 12px;
      }

      .widgets:hover .edit {
          margin: 0;
      }

      .widget {
          position: relative;
          height: 100%;
          padding: 0 1em;
      }

      .widget:first-child {
          padding-left: 2em;
      }

      .widget:last-child {
          padding-right: 2em;
      }

      .widget:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, .05);
      }

      #tabs > cols {
          position: relative;
          grid-template-columns: [chat-tab] 35px [tabs] auto [widgets] auto;
      }

      #tabs .time span {
          font-weight: 400;
      }

      #tabs i {
          font-size: 14pt !important;
      }

      .widget:not(:first-child)::before {
          content: '';
          position: absolute;
          display: block;
          left: 0;
          height: calc(100% - 15px);
          width: 1px;
          background: rgb(255 255 255 / 10%);
      }

      .fastlink {
          border: 0;
          background: #32302f;
          color: #a9b665;
          cursor: pointer;
          border-radius: 5px 15px 15px 5px;
      }

      .fastlink:hover {
          filter: brightness(1.2);
      }

      .fastlink-icon {
	      width: 70%;
      }
    `;
  }

  template() {
    return `
        <div id="tabs">
            <cols>
                <button class="+ fastlink">
                  <img class="fastlink-icon" src="src/img/pokeball.svg"/>
                </button>
                <ul class="- indicator"></ul>
                <div class="+ widgets col-end">
                    <current-time class="+ widget"></current-time>
                    <weather-forecast class="+ widget weather"></weather-forecast>
                </div>
            </cols>
        </div>`;
  }

  setEvents() {
    this.refs.tabs.forEach((tab) =>
      tab.onclick = ({ target }) => this.handleTabChange(target)
    );

    document.onkeydown = (e) => this.handleKeyPress(e);
    document.onwheel = (e) => this.handleWheelScroll(e);
    this.refs.fastlink.onclick = () => {
      console.log(CONFIG.fastlink);
      if (CONFIG.config.fastlink) {
        window.location.href = CONFIG.config.fastlink;
      }
    }

    if (CONFIG.openLastVisitedTab) {
      window.onbeforeunload = () => this.saveCurrentTab();
    }
  }

  saveCurrentTab() {
    localStorage.lastVisitedTab = this.currentTabIndex;
  }

  openLastVisitedTab() {
    if (!CONFIG.openLastVisitedTab) return;
    this.activateByKey(localStorage.lastVisitedTab);
  }

  handleTabChange(tab) {
    this.activateByKey(Number(tab.getAttribute("tab-index")));
  }

  handleWheelScroll(event) {
    if (!event) return;

    let { target, wheelDelta } = event;

    if (target.shadow && target.shadow.activeElement) return;

    let activeTab = -1;
    this.refs.tabs.forEach((tab, index) => {
      if (tab.getAttribute("active") === "") {
        activeTab = index;
      }
    });

    if (wheelDelta < 0) {
      this.activateByKey((activeTab + 1) % (this.refs.tabs.length - 1));
    } else {
      this.activateByKey(
        (activeTab - 1) < 0 ? this.refs.tabs.length - 2 : activeTab - 1,
      );
    }
  }

  handleKeyPress(event) {
    if (!event) return;

    let { target, key } = event;

    if (target.shadow && target.shadow.activeElement) return;

    if (
      Number.isInteger(parseInt(key)) &&
      key <= this.externalRefs.categories.length
    ) {
      this.activateByKey(key - 1);
    }
  }

  activateByKey(key) {
    if (key < 0) return;
    this.currentTabIndex = key;

    this.activate(this.refs.tabs, this.refs.tabs[key]);
    this.activate(
      this.externalRefs.categories,
      this.externalRefs.categories[key],
    );
  }

  createTabs() {
    const categoriesCount = this.externalRefs.categories.length;

    for (let i = 0; i <= categoriesCount; i++) {
      this.refs.indicator.innerHTML += `<li tab-index=${i} ${i == 0 ? "active" : ""
        }></li>`;
    }
  }

  activate(target, item) {
    target.forEach((i) => i.removeAttribute("active"));
    item.setAttribute("active", "");
  }

  connectedCallback() {
    this.render().then(() => {
      this.createTabs();
      this.setEvents();
      this.openLastVisitedTab();
    });
  }
}
