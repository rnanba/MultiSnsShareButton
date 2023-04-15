class MultiSnsShareButton {
  config = null
  default_config = {
    lang: "en",
    id_prefix: "mssb",
    icon_prefix: "./",
    article_selector: null,
    placeholder_selector: null,
    placeholder_extractor: null,
    title_extractor: null,
    title_selector: null,
    link_extractor: null,
    link_selector: null
  }
  icons = {
    mastodon: "mastodon-icon.svg",
    misskey: "misskey-icon.png",
    twitter: "twitter-icon.svg",
    facebook: "facebook-icon.svg"
  }
  instance_lists = {
    mastodon: [
      "https://mastodon.social",
      "https://pawoo.net",
      "https://mstdn.jp",
      "https://mastodon.cloud",
      "https://fedibird.com"
    ],
    misskey: [
      "https://misskey.io",
      "https://misskey.cf",
      "https://nijimiss.moe",
      "https://sushi.ski"
    ]
  }
  messages = {
    share_with_mastodon: {
      en: "Share with Mastodon",
      ja: "Mastodon でシェア"
    },
    share_with_misskey: {
      en: "Share with Misskey",
      ja: "Misskey でシェア"
    },
    share_with_twitter: {
      en: "Share with Twitter",
      ja: "Twitter でシェア"
    },
    share_with_facebook: {
      en: "Share with Facebook",
      ja: "Facebook でシェア"
    },
    select_instance: {
      mastodon: {
        en: "Specify Mastodon Instance and Share",
        ja: "Mastodon インスタンスを指定してシェア"
      },
      misskey: {
        en: "Specify Misskey Instance and Share",
        ja: "Misskey インスタンスを指定してシェア"
      }
    },
    instance_url: {
      en: "Instance URL",
      ja: "インスタンスURL"
    },
    url_input_placeholder: {
      en: "click to select history or popular instance list",
      ja: "クリックで履歴または人気インスタンス一覧から選択"
    },
    cancel: {
      en: "Cancel",
      ja: "キャンセル"
    },
    share: {
      en: "Share",
      ja: "シェア"
    }
  }
  constructor(config = null) {
    this.config = {}
    Object.assign(this.config, this.default_config)
    if (config != null) {
      Object.assign(this.config, config)
    }
    window.addEventListener('DOMContentLoaded', () => { this.setup() })
  }
  setup() {
    const lang = this.config.lang
    const id_prefix = this.config.id_prefix
    const msg = this.messages
    const instance_lists = this.instance_lists
    if (this.config.placeholder_selector === null) {
      this.config.placeholder_selector = "." + this.placeholderClassName()
    }
    const dialog = document.createElement("dialog")
    dialog.id = id_prefix + "_mstdnshare"
    dialog.innerHTML =
      `<form name='${id_prefix}_mstdnshare' method='dialog'>\
         <h4 id='${id_prefix}_mstdnshare_title'></h4>\
         <div>\
           <span class='${id_prefix}_input_label'>\
             ${msg.instance_url[lang]}:\
           </span>\
           <input id='${id_prefix}_instance_input' type='url' \
                  list='${id_prefix}_instance_list' autocomplete='on' \
                  placeholder='${msg.url_input_placeholder[lang]}'>\
           <input id='${id_prefix}_dummy_submit'\
                  style='display:none' type='submit'>\
           <menu>\
             <button value='cancel'>${msg.cancel[lang]}</button>\
             <button id='${id_prefix}_mstdnshare_ok' \
                     value='default'>${msg.share[lang]}</button>\
           </menu>\
         </div>\
         <datalist id='${id_prefix}_instance_list'></datalist>
       </form>`
    document.body.appendChild(dialog)
    
    const icons = this.icons
    const icon_prefix = this.config.icon_prefix
    const selectMastodonInstance = (type, event) => {
      event.preventDefault()
      const target = event.target
      const icon = icon_prefix + icons[type]
      const dialog = document.getElementById(id_prefix + "_mstdnshare")
      dialog.className = type
      const title = document.getElementById(id_prefix + "_mstdnshare_title")
      title.innerHTML = `<img src='${icon}'>${msg.select_instance[type][lang]}`
      const input = document.getElementById(id_prefix + "_instance_input")
      input.value = ""
      const input_name = {
        "mastodon": "mstdnurl",
        "misskey": "mskyurl"
      }
      input.name = input_name[type]
      const datalist = document.getElementById(id_prefix + "_instance_list")
      datalist.replaceChildren()
      for (const instance of instance_lists[type]) {
        let option = document.createElement("option")
        option.value = instance
        datalist.append(option)
      }
      const onclick = {
        "mastodon": () => { this.shareWithMastodon(target) },
        "misskey": () => { this.shareWithMisskey(target) }
      }
      const ok = dialog.querySelector("#" + id_prefix + "_mstdnshare_ok")
      const dummy = dialog.querySelector("#" + id_prefix + "_dummy_submit")
      ok.onclick = dummy.onclick = onclick[type]
      dialog.querySelector("#" + id_prefix + "_mstdnshare_ok").onclick =
        onclick[type]
      dialog.showModal()
    }
    
    document.querySelectorAll("." + this.placeholderClassName()).forEach(
      (placeholder) => {
        placeholder.appendChild(this.createButton(
          //this.icons.mastodon, msg.share_with_mastodon[lang],
          "mastodon", lang,
          (e) => { selectMastodonInstance("mastodon", e) }))
        placeholder.appendChild(this.createButton(
          //this.icons.misskey, msg.share_with_misskey[lang],
          "misskey", lang, 
          (e) => { selectMastodonInstance("misskey", e) }))
        
        placeholder.appendChild(this.createButton(
          //this.icons.twitter, msg.share_with_twitter[lang],
          "twitter", lang,
          (e) => this.shareWithTwitter(e) ))

        placeholder.appendChild(this.createButton(
          //this.icons.facebook, msg.share_with_facebook[lang],
          "facebook", lang,
          (e) => this.shareWithFacebook(e) ))
    })
  }
  createButton(type, lang, onclick) {
    const title = this.messages["share_with_"+type][lang]
    const icon = this.icons[type]
    const prefix = this.config.id_prefix
    const a = document.createElement("a")
    a.className =
      prefix + "_sharebutton" + " " + prefix + "_" + type + "_sharebutton"
    a.href = "#"
    a.title = title
    a.onclick = onclick
    const img = document.createElement("img")
    img.alt = title
    img.src = this.config.icon_prefix + icon
    a.appendChild(img)
    return a
  }
  shareWithMastodon(target) {
    const metadata = this.getArticleMetadata(target)
    const conf = this.config
    const id_prefix = conf.id_prefix
    let shareUrl = document.forms[id_prefix + "_mstdnshare"]["mstdnurl"].value
    shareUrl += "/share?text="
    shareUrl += encodeURIComponent(metadata.title + "\n" + metadata.url)
    window.open(shareUrl, "_blank")
  }
  shareWithMisskey(target) {
    const metadata = this.getArticleMetadata(target)
    const conf = this.config
    const id_prefix = conf.id_prefix
    let shareUrl = document.forms[id_prefix + "_mstdnshare"]["mskyurl"].value
    shareUrl += "/share?text="
    shareUrl += encodeURIComponent(metadata.title + "\n" + metadata.url)
    window.open(shareUrl, "_blank")
  }
  shareWithTwitter(event) {
    event.preventDefault()
    const metadata = this.getArticleMetadata(event.target)
    let shareUrl = "https://twitter.com/intent/tweet?text="
    shareUrl += encodeURIComponent(metadata.title + "\n" + metadata.url)
    window.open(shareUrl, "_blank")
  }
  shareWithFacebook(event) {
    event.preventDefault()
    const metadata = this.getArticleMetadata(event.target)
    let shareUrl = "https://www.facebook.com/sharer/sharer.php?u="
    shareUrl += encodeURIComponent(metadata.url)
    window.open(shareUrl, "_blank")
  }
  getArticleMetadata(target) {
    const metadata = {
      title: document.title,
      url: document.location
    }
    if (this.config.article_selector !== null) {
      const article = this.findArticleContaining(target)
      console.log("selected_article:", article)
      if (article !== null) {
        metadata.title = this.extractArticleTitle(article)
        metadata.url = this.extractArticlePermalink(article)
      }
    }
    return metadata
  }
  placeholderClassName() {
    return this.config.id_prefix + "-placeholder"
  }
  findArticleContaining(target) {
    const placeholder_class_name = this.placeholderClassName()
    while (target.className !== placeholder_class_name) {
      target = target.parentNode
      if (target === null) {
        return null
      }
    }
    console.log("target:", target)
    const conf = this.config
    if (conf.article_selector === null) {
      return null
    }
    let found = null
    document.querySelectorAll(conf.article_selector).forEach((article) => {
      console.log("article:", article)
      if (found === null) {
        if (conf.placeholder_extractor !== null &&
            conf.placeholder_extractor(article, this) === target) {
          found = article
        } else if (article.querySelector(conf.placeholder_selector) === target) {
          found = article
        }
      }
    })
    return found
  }
  extractArticleTitle(article) {
    let title = "[ERROR] fail to extract article title."
    const conf = this.config
    if (conf.title_extractor !== null) {
      title = conf.title_extractor(article, this)
    } else if (conf.title_selector !== null) {
      const elm = article.querySelector(conf.title_selector)
      if (elm !== null) {
        title = elm.textContent
      }
    }
    return title
  }
  extractArticlePermalink(article) {
    let url = "[ERROR] fail to extract article permalink."
    const conf = this.config
    if (conf.link_extractor !== null) {
      url = conf.link_extractor(article, this)
    } else if (conf.link_selector !== null) {
      const elm = article.querySelector(conf.link_selector)
      if (elm !== null) {
        url = elm.href
      }
    }
    return url
  }
}

