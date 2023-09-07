class ConfigTab extends Component {
  refs = {
    config: '#config',
    textarea: '#config textarea[type="text"]',
    save: '.save',
    close: '.close'
  };

  constructor() {
    super();

    this.config = JSON.parse(localStorage.getItem("config")).config;
  }

  style() {
    return `
      #config {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: calc(100% - 2px);
          height: 100%;
          background: rgb(24 24 29 / 80%);
          z-index: 99;
          visibility: hidden;
          top: -100%;
          backdrop-filter: blur(5px);
          transition: all .2s ease-in-out;
      }

      #config.active {
          top: 0;
          visibility: visible;
      }

      #config div {
          position: relative;
          width: 80%;
      }

      #config textarea {
          border: 0;
          outline: 0;
          width: 100%;
          box-shadow: inset 0 -2px #737373;
          padding: .5em 0;
          background: none;
          font: 300 16px 'Roboto', sans-serif;
          letter-spacing: 1px;
          color: #d4be98;
          resize: none;
          height: 300px;
          -ms-overflow-style: none;
          scrollbar-width: none;
      }

      #config textarea:focus {
          box-shadow: inset 0 -2px #d4be98;
      }

      #config textarea::selection {
          background: #e78a4e;
          color: #32302f;
      }

      #config textarea::-webkit-scrollbar {
        display: none;
      }

      #config .save {
          background: 0;
          border: 0;
          outline: 0;
          color: #d4be98;
          position: absolute;
          right: 40px;
          cursor: pointer;
          top: 15px;
          font-size: 18px;
          font-family: 'Roboto';
      }

      #config .save:hover {
          filter: opacity(.5);
      }

      #config .close {
          background: 0;
          border: 0;
          outline: 0;
          color: #d4be98;
          position: absolute;
          right: 0;
          cursor: pointer;
          top: 15px;
      }

      #config .close:hover {
          filter: opacity(.5);
      }
    `;
  }

  imports() {
    return [
      this.resources.fonts.roboto,
      this.resources.icons.material
    ];
  }

  template() {
    return `
        <div id="config">
          <div>
            <textarea type="text" spellcheck="false"></textarea>
            <button class="save">Save</button>
            <button class="close"><i class="material-icons">&#xE5CD;</i></button>
          </div>
        </div>
    `;
  }

  activate() {
    this.refs.config.classList.add('active');
    this.refs.textarea.scrollIntoView();
    setTimeout(() => this.refs.textarea.focus(), 100);
  }

  deactivate() {
    this.refs.config.classList.remove('active');
  }

  saveConfig() {
    localStorage.setItem("CONFIG", this.refs.textarea.value);
    this.deactivate();
    location.reload();
  }

  handleSearch(event) {
    const { key } = event;

    if (key === 'Escape')
      this.deactivate();
  }

  setEvents() {
    this.refs.config.onkeyup = (e) => this.handleSearch(e);
    this.refs.close.onclick = () => this.deactivate();
    this.refs.save.onclick = () => this.saveConfig();
  }

  setConfig() {
    this.refs.textarea.value =  JSON.stringify(this.config, null, 4);
  }

  connectedCallback() {
    this.render().then(() => {
      this.setEvents();
      this.setConfig();
    });
  }
}
