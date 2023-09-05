const components = {
  'search-bar': Search,
  'config-tab': ConfigTab,
  'status-bar': Statusbar,
  'current-time': Clock,
  'weather-forecast': Weather,
  'tabs-list': Tabs,
};

Object.keys(components).forEach(componentName => {
  if (!CONFIG.disabled.includes(componentName))
    customElements.define(componentName, components[componentName]);
});
