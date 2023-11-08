let saved_config = JSON.parse(localStorage.getItem("CONFIG"));

const default_config = {
  overrideStorage: true,
  temperature: {
    location: "Utrecht, Netherlands",
    scale: "C",
  },
  clock: {
    format: "h:i p",
    iconColor: "#ea6962",
  },
  search: {
    engines: {
      g: ["https://google.com/search?q=", "Google"],
      d: ["https://duckduckgo.com/html?q=", "DuckDuckGo"],
      y: ["https://youtube.com/results?search_query=", "Youtube"],
      r: ["https://www.reddit.com/search/?q=", "Reddit"],
    },
  },
  keybindings: {
    s: "search-bar",
    q: "config-tab",
  },
  disabled: [],
  localIcons: false,
  fastlink: "https://chat.openai.com/",
  openLastVisitedTab: true,
  tabs: [
    {
      name: "chi ll",
      background_url: "src/img/banners/cbg-2.gif",
      categories: [
        {
          name: "Social Media",
          links: [
            {
              name: "whatsapp",
              url: "https://web.whatsapp.com/",
              icon: "brand-whatsapp",
              icon_color: "#a9b665",
            },
            {
              name: "twitter",
              url: "https://twitter.com/home",
              icon: "brand-twitter-filled",
              icon_color: "#7daea3",
            },
            {
              name: "reddit",
              url: "https://www.reddit.com/",
              icon: "brand-reddit",
              icon_color: "#e78a4e",
            },
            {
              name: "youtube",
              url: "https://www.youtube.com/",
              icon: "brand-youtube-filled",
              icon_color: "#ea6962",
            },
            {
              name: "twitch",
              url: "https://www.twitch.tv/",
              icon: "brand-twitch",
              icon_color: "#d3869b",
            },
          ],
        },
        {
          name: "Manga",
          links: [
            {
              name: "Mangadex",
              url: "https://www.mangadex.org",
              icon: "activity-heartbeat",
              icon_color: "#a9b665",
            },
            {
              name: "Flame scans",
              url: "http://flamecomics.com",
              icon: "flame",
              icon_color: "#e78a4e",
            },
            {
              name: "Reaper scans",
              url: "https://reaperscans.com",
              icon: "book",
              icon_color: "#ea6962",
            },
            {
              name: "Asura scans",
              url: "https://asuratoon.com",
              icon: "book",
              icon_color: "#d3869b",
            },
          ],
        },
        {
          name: "Video",
          links: [
            {
              name: "primevideo",
              url: "https://www.primevideo.com/region/eu/?ref_=dv_web_unknown",
              icon: "brand-amazon",
              icon_color: "#7daea3",
            },
            {
              name: "netflix",
              url: "https://www.netflix.com",
              icon: "brand-netflix",
              icon_color: "#7daea3",
            },
          ],
        },
      ],
    },
    {
      name: "design",
      background_url: "src/img/banners/cbg-6.gif",
      categories: [
        {
          name: "inspiration",
          links: [
            {
              name: "pinterest",
              url: "https://www.pinterest.com/",
              icon: "brand-pinterest",
              icon_color: "#ea6962",
            },
            {
              name: "leonardo ai",
              url: "https://app.leonardo.ai/",
              icon: "brand-openai",
              icon_color: "#89b482",
            },
            {
              name: "dribble",
              url: "https://dribbble.com/following",
              icon: "brand-dribbble-filled",
              icon_color: "#d3869b",
            },
          ],
        },
        {
          name: "resources",
          links: [
            {
              name: "colorhunt",
              url: "https://colorhunt.co/",
              icon: "color-picker",
              icon_color: "#ea6962",
            },
            {
              name: "adobe color",
              url: "https://color.adobe.com/es/create/color-wheel",
              icon: "brand-adobe",
              icon_color: "#7daea3",
            },
            {
              name: "terminalsexy",
              url: "https://terminal.sexy",
              icon: "prompt",
              icon_color: "#e78a4e",
            },
          ],
        },
        {
          name: "resources 3d",
          links: [
            {
              name: "thingiverse",
              url: "https://www.thingiverse.com/",
              icon: "circle-letter-t",
              icon_color: "#7daea3",
            },
            {
              name: "Gumroad",
              url: "https://wwww.gumroad.com/",
              icon: "brand-gumroad",
              icon_color: "#7daea3",
            },
          ],
        },
      ],
    },
    {
      name: "dev",
      background_url: "src/img/banners/cbg-7.gif",
      categories: [
        {
          name: "repositories",
          links: [
            {
              name: "github",
              url: "https://github.com/",
              icon: "brand-github",
              icon_color: "#7daea3",
            },
            {
              name: "docker hub",
              url: "https://hub.docker.com/repositories/xiiisins",
              icon: "brand-docker",
              icon_color: "#e78a4e",
            },
            {
              name: "ansible galaxy",
              url: "https://galaxy.ansible.com/ui",
              icon: "brand-ansible",
              icon_color: "#ea6962",
            },
          ],
        },
        {
          name: "resources",
          links: [
            {
              name: "phind",
              url: "https://www.phind.com/",
              icon: "brand-openai",
              icon_color: "#89b482",
            },
            {
              name: "StackOverflow"
              url: "https://www.stackoverflow.com"
              icon: "brand-stackoverflow",
              icon_color: "#e78a4e",
            },
          ],
        },
        {
          name: "Infrastructure Services",
          links: [
            {
              name: "DigitalOcean",
              url: "https://digitalocean.com/",
              icon: "cloud-filled",
              icon_color: "#7daea3",
            },
            {
              name: "Cloudflare",
              url: "https://dash.cloudflare.com",
              icon: "brand-cloudflare",
              icon_color: "#e78a4e",
            },
          ],
        },
      ],
    },
    {
      name: "myself",
      background_url: "src/img/banners/cbg-9.gif",
      categories: [
        {
          name: "mails",
          links: [
            {
              name: "gmail",
              url: "https://mail.google.com/mail/u/0/",
              icon: "brand-gmail",
              icon_color: "#ea6962",
            },
            {
              name: "XIIISins mail",
              url: "https://mail.google.com/mail/u/1/",
              icon: "brand-gmail",
              icon_color: "#e78a4e",
            },
          ],
        },
        {
          name: "storage",
          links: [
            {
              name: "drive",
              url: "https://drive.google.com/drive/u/0/my-drive",
              icon: "brand-google-drive",
              icon_color: "#e78a4e",
            },
            {
              name: "dropbox",
              url: "https://www.dropbox.com/h?role=personal&di=left_nav",
              icon: "box-seam",
              icon_color: "#7daea3",
            },
            {
              name: "photos",
              url: "https://photos.google.com/u/1",
              icon: "photo-filled",
              icon_color: "#ea6962",
            },
            {
              name: "iCloud",
              url: "https://www.icloud.com/",
              icon: "brand-apple",
              icon_color: "#d3869b",
            },
          ],
        },
        {
          name: "stuff",
          links: [
            {
              name: "tweakers",
              url: "https://www.tweakers.net",
              icon: "article",
              icon_color: "#e78a4e",
            },
            {
              name: "bol.com",
              url: "https://www.bol.com",
              icon: "shopping-bag",
              icon_color: "#7daea3",
            },
            {
              name: "Amazon",
              url: "https://www.amazon.nl",
              icon: "brand-amazon",
              icon_color: "#ea6962",
            },
          ],
        },
      ],
    },
  ],
};

const CONFIG = new Config(saved_config ?? default_config);
// const CONFIG = new Config(default_config);

(function () {
  var css = document.createElement("link");
  css.href = "src/css/tabler-icons.min.css";
  css.rel = "stylesheet";
  css.type = "text/css";
  if (!CONFIG.config.localIcons)
    document.getElementsByTagName("head")[0].appendChild(css);
})();
