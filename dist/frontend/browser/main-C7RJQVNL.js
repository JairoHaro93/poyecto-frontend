var cD = Object.create;
var Ra = Object.defineProperty,
  lD = Object.defineProperties,
  uD = Object.getOwnPropertyDescriptor,
  dD = Object.getOwnPropertyDescriptors,
  fD = Object.getOwnPropertyNames,
  jd = Object.getOwnPropertySymbols,
  hD = Object.getPrototypeOf,
  Ud = Object.prototype.hasOwnProperty,
  pD = Object.prototype.propertyIsEnumerable;
var Bd = (e, t, n) =>
    t in e
      ? Ra(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  b = (e, t) => {
    for (var n in (t ||= {})) Ud.call(t, n) && Bd(e, n, t[n]);
    if (jd) for (var n of jd(t)) pD.call(t, n) && Bd(e, n, t[n]);
    return e;
  },
  U = (e, t) => lD(e, dD(t));
var gD = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var mD = (e, t, n, r) => {
  if ((t && typeof t == "object") || typeof t == "function")
    for (let o of fD(t))
      !Ud.call(e, o) &&
        o !== n &&
        Ra(e, o, {
          get: () => t[o],
          enumerable: !(r = uD(t, o)) || r.enumerable,
        });
  return e;
};
var $d = (e, t, n) => (
  (n = e != null ? cD(hD(e)) : {}),
  mD(
    t || !e || !e.__esModule
      ? Ra(n, "default", { value: e, enumerable: !0 })
      : n,
    e
  )
);
var Hn = (e, t, n) =>
  new Promise((r, o) => {
    var i = (u) => {
        try {
          l(n.next(u));
        } catch (f) {
          o(f);
        }
      },
      s = (u) => {
        try {
          l(n.throw(u));
        } catch (f) {
          o(f);
        }
      },
      l = (u) => (u.done ? r(u.value) : Promise.resolve(u.value).then(i, s));
    l((n = n.apply(e, t)).next());
  });
var Bu = gD((wt, ju) => {
  "use strict";
  (function (e, t) {
    typeof wt == "object" && typeof ju < "u"
      ? (ju.exports = t())
      : typeof define == "function" && define.amd
      ? define(t)
      : ((e = typeof globalThis < "u" ? globalThis : e || self),
        (e.Sweetalert2 = t()));
  })(wt, function () {
    "use strict";
    function e(a, c, d) {
      if (typeof a == "function" ? a === c : a.has(c))
        return arguments.length < 3 ? c : d;
      throw new TypeError("Private element is not present on this object");
    }
    function t(a, c) {
      if (c.has(a))
        throw new TypeError(
          "Cannot initialize the same private elements twice on an object"
        );
    }
    function n(a, c) {
      return a.get(e(a, c));
    }
    function r(a, c, d) {
      t(a, c), c.set(a, d);
    }
    function o(a, c, d) {
      return a.set(e(a, c), d), d;
    }
    let i = 100,
      s = {},
      l = () => {
        s.previousActiveElement instanceof HTMLElement
          ? (s.previousActiveElement.focus(), (s.previousActiveElement = null))
          : document.body && document.body.focus();
      },
      u = (a) =>
        new Promise((c) => {
          if (!a) return c();
          let d = window.scrollX,
            p = window.scrollY;
          (s.restoreFocusTimeout = setTimeout(() => {
            l(), c();
          }, i)),
            window.scrollTo(d, p);
        }),
      f = "swal2-",
      h = [
        "container",
        "shown",
        "height-auto",
        "iosfix",
        "popup",
        "modal",
        "no-backdrop",
        "no-transition",
        "toast",
        "toast-shown",
        "show",
        "hide",
        "close",
        "title",
        "html-container",
        "actions",
        "confirm",
        "deny",
        "cancel",
        "default-outline",
        "footer",
        "icon",
        "icon-content",
        "image",
        "input",
        "file",
        "range",
        "select",
        "radio",
        "checkbox",
        "label",
        "textarea",
        "inputerror",
        "input-label",
        "validation-message",
        "progress-steps",
        "active-progress-step",
        "progress-step",
        "progress-step-line",
        "loader",
        "loading",
        "styled",
        "top",
        "top-start",
        "top-end",
        "top-left",
        "top-right",
        "center",
        "center-start",
        "center-end",
        "center-left",
        "center-right",
        "bottom",
        "bottom-start",
        "bottom-end",
        "bottom-left",
        "bottom-right",
        "grow-row",
        "grow-column",
        "grow-fullscreen",
        "rtl",
        "timer-progress-bar",
        "timer-progress-bar-container",
        "scrollbar-measure",
        "icon-success",
        "icon-warning",
        "icon-info",
        "icon-question",
        "icon-error",
        "dragging",
      ].reduce((a, c) => ((a[c] = f + c), a), {}),
      v = ["success", "warning", "info", "question", "error"].reduce(
        (a, c) => ((a[c] = f + c), a),
        {}
      ),
      D = "SweetAlert2:",
      I = (a) => a.charAt(0).toUpperCase() + a.slice(1),
      E = (a) => {
        console.warn(`${D} ${typeof a == "object" ? a.join(" ") : a}`);
      },
      x = (a) => {
        console.error(`${D} ${a}`);
      },
      ee = [],
      j = (a) => {
        ee.includes(a) || (ee.push(a), E(a));
      },
      ce = function (a) {
        let c =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
        j(
          `"${a}" is deprecated and will be removed in the next major release.${
            c ? ` Use "${c}" instead.` : ""
          }`
        );
      },
      he = (a) => (typeof a == "function" ? a() : a),
      ne = (a) => a && typeof a.toPromise == "function",
      Ee = (a) => (ne(a) ? a.toPromise() : Promise.resolve(a)),
      cn = (a) => a && Promise.resolve(a) === a,
      be = () => document.body.querySelector(`.${h.container}`),
      Lr = (a) => {
        let c = be();
        return c ? c.querySelector(a) : null;
      },
      Oe = (a) => Lr(`.${a}`),
      q = () => Oe(h.popup),
      Pn = () => Oe(h.icon),
      Av = () => Oe(h["icon-content"]),
      Uu = () => Oe(h.title),
      ga = () => Oe(h["html-container"]),
      $u = () => Oe(h.image),
      ma = () => Oe(h["progress-steps"]),
      zo = () => Oe(h["validation-message"]),
      at = () => Lr(`.${h.actions} .${h.confirm}`),
      Fn = () => Lr(`.${h.actions} .${h.cancel}`),
      ln = () => Lr(`.${h.actions} .${h.deny}`),
      Nv = () => Oe(h["input-label"]),
      kn = () => Lr(`.${h.loader}`),
      Vr = () => Oe(h.actions),
      Hu = () => Oe(h.footer),
      Go = () => Oe(h["timer-progress-bar"]),
      va = () => Oe(h.close),
      Rv = `
  a[href],
  area[href],
  input:not([disabled]),
  select:not([disabled]),
  textarea:not([disabled]),
  button:not([disabled]),
  iframe,
  object,
  embed,
  [tabindex="0"],
  [contenteditable],
  audio[controls],
  video[controls],
  summary
`,
      ya = () => {
        let a = q();
        if (!a) return [];
        let c = a.querySelectorAll(
            '[tabindex]:not([tabindex="-1"]):not([tabindex="0"])'
          ),
          d = Array.from(c).sort((C, F) => {
            let B = parseInt(C.getAttribute("tabindex") || "0"),
              re = parseInt(F.getAttribute("tabindex") || "0");
            return B > re ? 1 : B < re ? -1 : 0;
          }),
          p = a.querySelectorAll(Rv),
          m = Array.from(p).filter((C) => C.getAttribute("tabindex") !== "-1");
        return [...new Set(d.concat(m))].filter((C) => Se(C));
      },
      wa = () =>
        Dt(document.body, h.shown) &&
        !Dt(document.body, h["toast-shown"]) &&
        !Dt(document.body, h["no-backdrop"]),
      qo = () => {
        let a = q();
        return a ? Dt(a, h.toast) : !1;
      },
      Ov = () => {
        let a = q();
        return a ? a.hasAttribute("data-loading") : !1;
      },
      Pe = (a, c) => {
        if (((a.textContent = ""), c)) {
          let p = new DOMParser().parseFromString(c, "text/html"),
            m = p.querySelector("head");
          m &&
            Array.from(m.childNodes).forEach((F) => {
              a.appendChild(F);
            });
          let C = p.querySelector("body");
          C &&
            Array.from(C.childNodes).forEach((F) => {
              F instanceof HTMLVideoElement || F instanceof HTMLAudioElement
                ? a.appendChild(F.cloneNode(!0))
                : a.appendChild(F);
            });
        }
      },
      Dt = (a, c) => {
        if (!c) return !1;
        let d = c.split(/\s+/);
        for (let p = 0; p < d.length; p++)
          if (!a.classList.contains(d[p])) return !1;
        return !0;
      },
      Pv = (a, c) => {
        Array.from(a.classList).forEach((d) => {
          !Object.values(h).includes(d) &&
            !Object.values(v).includes(d) &&
            !Object.values(c.showClass || {}).includes(d) &&
            a.classList.remove(d);
        });
      },
      Fe = (a, c, d) => {
        if ((Pv(a, c), !c.customClass)) return;
        let p = c.customClass[d];
        if (p) {
          if (typeof p != "string" && !p.forEach) {
            E(
              `Invalid type of customClass.${d}! Expected string or iterable object, got "${typeof p}"`
            );
            return;
          }
          z(a, p);
        }
      },
      Wo = (a, c) => {
        if (!c) return null;
        switch (c) {
          case "select":
          case "textarea":
          case "file":
            return a.querySelector(`.${h.popup} > .${h[c]}`);
          case "checkbox":
            return a.querySelector(`.${h.popup} > .${h.checkbox} input`);
          case "radio":
            return (
              a.querySelector(`.${h.popup} > .${h.radio} input:checked`) ||
              a.querySelector(`.${h.popup} > .${h.radio} input:first-child`)
            );
          case "range":
            return a.querySelector(`.${h.popup} > .${h.range} input`);
          default:
            return a.querySelector(`.${h.popup} > .${h.input}`);
        }
      },
      zu = (a) => {
        if ((a.focus(), a.type !== "file")) {
          let c = a.value;
          (a.value = ""), (a.value = c);
        }
      },
      Gu = (a, c, d) => {
        !a ||
          !c ||
          (typeof c == "string" && (c = c.split(/\s+/).filter(Boolean)),
          c.forEach((p) => {
            Array.isArray(a)
              ? a.forEach((m) => {
                  d ? m.classList.add(p) : m.classList.remove(p);
                })
              : d
              ? a.classList.add(p)
              : a.classList.remove(p);
          }));
      },
      z = (a, c) => {
        Gu(a, c, !0);
      },
      Ke = (a, c) => {
        Gu(a, c, !1);
      },
      Ot = (a, c) => {
        let d = Array.from(a.children);
        for (let p = 0; p < d.length; p++) {
          let m = d[p];
          if (m instanceof HTMLElement && Dt(m, c)) return m;
        }
      },
      un = (a, c, d) => {
        d === `${parseInt(d)}` && (d = parseInt(d)),
          d || parseInt(d) === 0
            ? a.style.setProperty(c, typeof d == "number" ? `${d}px` : d)
            : a.style.removeProperty(c);
      },
      me = function (a) {
        let c =
          arguments.length > 1 && arguments[1] !== void 0
            ? arguments[1]
            : "flex";
        a && (a.style.display = c);
      },
      Ce = (a) => {
        a && (a.style.display = "none");
      },
      Da = function (a) {
        let c =
          arguments.length > 1 && arguments[1] !== void 0
            ? arguments[1]
            : "block";
        a &&
          new MutationObserver(() => {
            jr(a, a.innerHTML, c);
          }).observe(a, { childList: !0, subtree: !0 });
      },
      qu = (a, c, d, p) => {
        let m = a.querySelector(c);
        m && m.style.setProperty(d, p);
      },
      jr = function (a, c) {
        let d =
          arguments.length > 2 && arguments[2] !== void 0
            ? arguments[2]
            : "flex";
        c ? me(a, d) : Ce(a);
      },
      Se = (a) =>
        !!(a && (a.offsetWidth || a.offsetHeight || a.getClientRects().length)),
      Fv = () => !Se(at()) && !Se(ln()) && !Se(Fn()),
      Wu = (a) => a.scrollHeight > a.clientHeight,
      Zu = (a) => {
        let c = window.getComputedStyle(a),
          d = parseFloat(c.getPropertyValue("animation-duration") || "0"),
          p = parseFloat(c.getPropertyValue("transition-duration") || "0");
        return d > 0 || p > 0;
      },
      ba = function (a) {
        let c =
            arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1,
          d = Go();
        d &&
          Se(d) &&
          (c && ((d.style.transition = "none"), (d.style.width = "100%")),
          setTimeout(() => {
            (d.style.transition = `width ${a / 1e3}s linear`),
              (d.style.width = "0%");
          }, 10));
      },
      kv = () => {
        let a = Go();
        if (!a) return;
        let c = parseInt(window.getComputedStyle(a).width);
        a.style.removeProperty("transition"), (a.style.width = "100%");
        let d = parseInt(window.getComputedStyle(a).width),
          p = (c / d) * 100;
        a.style.width = `${p}%`;
      },
      Lv = () => typeof window > "u" || typeof document > "u",
      Vv = `
 <div aria-labelledby="${h.title}" aria-describedby="${h["html-container"]}" class="${h.popup}" tabindex="-1">
   <button type="button" class="${h.close}"></button>
   <ul class="${h["progress-steps"]}"></ul>
   <div class="${h.icon}"></div>
   <img class="${h.image}" />
   <h2 class="${h.title}" id="${h.title}"></h2>
   <div class="${h["html-container"]}" id="${h["html-container"]}"></div>
   <input class="${h.input}" id="${h.input}" />
   <input type="file" class="${h.file}" />
   <div class="${h.range}">
     <input type="range" />
     <output></output>
   </div>
   <select class="${h.select}" id="${h.select}"></select>
   <div class="${h.radio}"></div>
   <label class="${h.checkbox}">
     <input type="checkbox" id="${h.checkbox}" />
     <span class="${h.label}"></span>
   </label>
   <textarea class="${h.textarea}" id="${h.textarea}"></textarea>
   <div class="${h["validation-message"]}" id="${h["validation-message"]}"></div>
   <div class="${h.actions}">
     <div class="${h.loader}"></div>
     <button type="button" class="${h.confirm}"></button>
     <button type="button" class="${h.deny}"></button>
     <button type="button" class="${h.cancel}"></button>
   </div>
   <div class="${h.footer}"></div>
   <div class="${h["timer-progress-bar-container"]}">
     <div class="${h["timer-progress-bar"]}"></div>
   </div>
 </div>
`.replace(/(^|\n)\s*/g, ""),
      jv = () => {
        let a = be();
        return a
          ? (a.remove(),
            Ke(
              [document.documentElement, document.body],
              [h["no-backdrop"], h["toast-shown"], h["has-column"]]
            ),
            !0)
          : !1;
      },
      dn = () => {
        s.currentInstance.resetValidationMessage();
      },
      Bv = () => {
        let a = q(),
          c = Ot(a, h.input),
          d = Ot(a, h.file),
          p = a.querySelector(`.${h.range} input`),
          m = a.querySelector(`.${h.range} output`),
          C = Ot(a, h.select),
          F = a.querySelector(`.${h.checkbox} input`),
          B = Ot(a, h.textarea);
        (c.oninput = dn),
          (d.onchange = dn),
          (C.onchange = dn),
          (F.onchange = dn),
          (B.oninput = dn),
          (p.oninput = () => {
            dn(), (m.value = p.value);
          }),
          (p.onchange = () => {
            dn(), (m.value = p.value);
          });
      },
      Uv = (a) => (typeof a == "string" ? document.querySelector(a) : a),
      $v = (a) => {
        let c = q();
        c.setAttribute("role", a.toast ? "alert" : "dialog"),
          c.setAttribute("aria-live", a.toast ? "polite" : "assertive"),
          a.toast || c.setAttribute("aria-modal", "true");
      },
      Hv = (a) => {
        window.getComputedStyle(a).direction === "rtl" && z(be(), h.rtl);
      },
      zv = (a) => {
        let c = jv();
        if (Lv()) {
          x("SweetAlert2 requires document to initialize");
          return;
        }
        let d = document.createElement("div");
        (d.className = h.container), c && z(d, h["no-transition"]), Pe(d, Vv);
        let p = Uv(a.target);
        p.appendChild(d), $v(a), Hv(p), Bv();
      },
      Ca = (a, c) => {
        a instanceof HTMLElement
          ? c.appendChild(a)
          : typeof a == "object"
          ? Gv(a, c)
          : a && Pe(c, a);
      },
      Gv = (a, c) => {
        a.jquery ? qv(c, a) : Pe(c, a.toString());
      },
      qv = (a, c) => {
        if (((a.textContent = ""), 0 in c))
          for (let d = 0; d in c; d++) a.appendChild(c[d].cloneNode(!0));
        else a.appendChild(c.cloneNode(!0));
      },
      Wv = (a, c) => {
        let d = Vr(),
          p = kn();
        !d ||
          !p ||
          (!c.showConfirmButton && !c.showDenyButton && !c.showCancelButton
            ? Ce(d)
            : me(d),
          Fe(d, c, "actions"),
          Zv(d, p, c),
          Pe(p, c.loaderHtml || ""),
          Fe(p, c, "loader"));
      };
    function Zv(a, c, d) {
      let p = at(),
        m = ln(),
        C = Fn();
      !p ||
        !m ||
        !C ||
        (Ea(p, "confirm", d),
        Ea(m, "deny", d),
        Ea(C, "cancel", d),
        Yv(p, m, C, d),
        d.reverseButtons &&
          (d.toast
            ? (a.insertBefore(C, p), a.insertBefore(m, p))
            : (a.insertBefore(C, c),
              a.insertBefore(m, c),
              a.insertBefore(p, c))));
    }
    function Yv(a, c, d, p) {
      if (!p.buttonsStyling) {
        Ke([a, c, d], h.styled);
        return;
      }
      z([a, c, d], h.styled),
        p.confirmButtonColor &&
          ((a.style.backgroundColor = p.confirmButtonColor),
          z(a, h["default-outline"])),
        p.denyButtonColor &&
          ((c.style.backgroundColor = p.denyButtonColor),
          z(c, h["default-outline"])),
        p.cancelButtonColor &&
          ((d.style.backgroundColor = p.cancelButtonColor),
          z(d, h["default-outline"]));
    }
    function Ea(a, c, d) {
      let p = I(c);
      jr(a, d[`show${p}Button`], "inline-block"),
        Pe(a, d[`${c}ButtonText`] || ""),
        a.setAttribute("aria-label", d[`${c}ButtonAriaLabel`] || ""),
        (a.className = h[c]),
        Fe(a, d, `${c}Button`);
    }
    let Qv = (a, c) => {
        let d = va();
        d &&
          (Pe(d, c.closeButtonHtml || ""),
          Fe(d, c, "closeButton"),
          jr(d, c.showCloseButton),
          d.setAttribute("aria-label", c.closeButtonAriaLabel || ""));
      },
      Kv = (a, c) => {
        let d = be();
        d &&
          (Xv(d, c.backdrop),
          Jv(d, c.position),
          ey(d, c.grow),
          Fe(d, c, "container"));
      };
    function Xv(a, c) {
      typeof c == "string"
        ? (a.style.background = c)
        : c || z([document.documentElement, document.body], h["no-backdrop"]);
    }
    function Jv(a, c) {
      c &&
        (c in h
          ? z(a, h[c])
          : (E('The "position" parameter is not valid, defaulting to "center"'),
            z(a, h.center)));
    }
    function ey(a, c) {
      c && z(a, h[`grow-${c}`]);
    }
    var K = { innerParams: new WeakMap(), domCache: new WeakMap() };
    let ty = [
        "input",
        "file",
        "range",
        "select",
        "radio",
        "checkbox",
        "textarea",
      ],
      ny = (a, c) => {
        let d = q();
        if (!d) return;
        let p = K.innerParams.get(a),
          m = !p || c.input !== p.input;
        ty.forEach((C) => {
          let F = Ot(d, h[C]);
          F && (iy(C, c.inputAttributes), (F.className = h[C]), m && Ce(F));
        }),
          c.input && (m && ry(c), sy(c));
      },
      ry = (a) => {
        if (!a.input) return;
        if (!se[a.input]) {
          x(
            `Unexpected type of input! Expected ${Object.keys(se).join(
              " | "
            )}, got "${a.input}"`
          );
          return;
        }
        let c = Yu(a.input);
        if (!c) return;
        let d = se[a.input](c, a);
        me(c),
          a.inputAutoFocus &&
            setTimeout(() => {
              zu(d);
            });
      },
      oy = (a) => {
        for (let c = 0; c < a.attributes.length; c++) {
          let d = a.attributes[c].name;
          ["id", "type", "value", "style"].includes(d) || a.removeAttribute(d);
        }
      },
      iy = (a, c) => {
        let d = q();
        if (!d) return;
        let p = Wo(d, a);
        if (p) {
          oy(p);
          for (let m in c) p.setAttribute(m, c[m]);
        }
      },
      sy = (a) => {
        if (!a.input) return;
        let c = Yu(a.input);
        c && Fe(c, a, "input");
      },
      Ia = (a, c) => {
        !a.placeholder &&
          c.inputPlaceholder &&
          (a.placeholder = c.inputPlaceholder);
      },
      Br = (a, c, d) => {
        if (d.inputLabel) {
          let p = document.createElement("label"),
            m = h["input-label"];
          p.setAttribute("for", a.id),
            (p.className = m),
            typeof d.customClass == "object" && z(p, d.customClass.inputLabel),
            (p.innerText = d.inputLabel),
            c.insertAdjacentElement("beforebegin", p);
        }
      },
      Yu = (a) => {
        let c = q();
        if (c) return Ot(c, h[a] || h.input);
      },
      Zo = (a, c) => {
        ["string", "number"].includes(typeof c)
          ? (a.value = `${c}`)
          : cn(c) ||
            E(
              `Unexpected type of inputValue! Expected "string", "number" or "Promise", got "${typeof c}"`
            );
      },
      se = {};
    (se.text =
      se.email =
      se.password =
      se.number =
      se.tel =
      se.url =
      se.search =
      se.date =
      se["datetime-local"] =
      se.time =
      se.week =
      se.month =
        (a, c) => (
          Zo(a, c.inputValue), Br(a, a, c), Ia(a, c), (a.type = c.input), a
        )),
      (se.file = (a, c) => (Br(a, a, c), Ia(a, c), a)),
      (se.range = (a, c) => {
        let d = a.querySelector("input"),
          p = a.querySelector("output");
        return (
          Zo(d, c.inputValue),
          (d.type = c.input),
          Zo(p, c.inputValue),
          Br(d, a, c),
          a
        );
      }),
      (se.select = (a, c) => {
        if (((a.textContent = ""), c.inputPlaceholder)) {
          let d = document.createElement("option");
          Pe(d, c.inputPlaceholder),
            (d.value = ""),
            (d.disabled = !0),
            (d.selected = !0),
            a.appendChild(d);
        }
        return Br(a, a, c), a;
      }),
      (se.radio = (a) => ((a.textContent = ""), a)),
      (se.checkbox = (a, c) => {
        let d = Wo(q(), "checkbox");
        (d.value = "1"), (d.checked = !!c.inputValue);
        let p = a.querySelector("span");
        return Pe(p, c.inputPlaceholder || c.inputLabel), d;
      }),
      (se.textarea = (a, c) => {
        Zo(a, c.inputValue), Ia(a, c), Br(a, a, c);
        let d = (p) =>
          parseInt(window.getComputedStyle(p).marginLeft) +
          parseInt(window.getComputedStyle(p).marginRight);
        return (
          setTimeout(() => {
            if ("MutationObserver" in window) {
              let p = parseInt(window.getComputedStyle(q()).width),
                m = () => {
                  if (!document.body.contains(a)) return;
                  let C = a.offsetWidth + d(a);
                  C > p
                    ? (q().style.width = `${C}px`)
                    : un(q(), "width", c.width);
                };
              new MutationObserver(m).observe(a, {
                attributes: !0,
                attributeFilter: ["style"],
              });
            }
          }),
          a
        );
      });
    let ay = (a, c) => {
        let d = ga();
        d &&
          (Da(d),
          Fe(d, c, "htmlContainer"),
          c.html
            ? (Ca(c.html, d), me(d, "block"))
            : c.text
            ? ((d.textContent = c.text), me(d, "block"))
            : Ce(d),
          ny(a, c));
      },
      cy = (a, c) => {
        let d = Hu();
        d &&
          (Da(d),
          jr(d, c.footer, "block"),
          c.footer && Ca(c.footer, d),
          Fe(d, c, "footer"));
      },
      ly = (a, c) => {
        let d = K.innerParams.get(a),
          p = Pn();
        if (p) {
          if (d && c.icon === d.icon) {
            Ku(p, c), Qu(p, c);
            return;
          }
          if (!c.icon && !c.iconHtml) {
            Ce(p);
            return;
          }
          if (c.icon && Object.keys(v).indexOf(c.icon) === -1) {
            x(
              `Unknown icon! Expected "success", "error", "warning", "info" or "question", got "${c.icon}"`
            ),
              Ce(p);
            return;
          }
          me(p), Ku(p, c), Qu(p, c), z(p, c.showClass && c.showClass.icon);
        }
      },
      Qu = (a, c) => {
        for (let [d, p] of Object.entries(v)) c.icon !== d && Ke(a, p);
        z(a, c.icon && v[c.icon]), hy(a, c), uy(), Fe(a, c, "icon");
      },
      uy = () => {
        let a = q();
        if (!a) return;
        let c = window.getComputedStyle(a).getPropertyValue("background-color"),
          d = a.querySelectorAll(
            "[class^=swal2-success-circular-line], .swal2-success-fix"
          );
        for (let p = 0; p < d.length; p++) d[p].style.backgroundColor = c;
      },
      dy = `
  <div class="swal2-success-circular-line-left"></div>
  <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>
  <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>
  <div class="swal2-success-circular-line-right"></div>
`,
      fy = `
  <span class="swal2-x-mark">
    <span class="swal2-x-mark-line-left"></span>
    <span class="swal2-x-mark-line-right"></span>
  </span>
`,
      Ku = (a, c) => {
        if (!c.icon && !c.iconHtml) return;
        let d = a.innerHTML,
          p = "";
        c.iconHtml
          ? (p = Xu(c.iconHtml))
          : c.icon === "success"
          ? ((p = dy), (d = d.replace(/ style=".*?"/g, "")))
          : c.icon === "error"
          ? (p = fy)
          : c.icon &&
            (p = Xu({ question: "?", warning: "!", info: "i" }[c.icon])),
          d.trim() !== p.trim() && Pe(a, p);
      },
      hy = (a, c) => {
        if (c.iconColor) {
          (a.style.color = c.iconColor), (a.style.borderColor = c.iconColor);
          for (let d of [
            ".swal2-success-line-tip",
            ".swal2-success-line-long",
            ".swal2-x-mark-line-left",
            ".swal2-x-mark-line-right",
          ])
            qu(a, d, "background-color", c.iconColor);
          qu(a, ".swal2-success-ring", "border-color", c.iconColor);
        }
      },
      Xu = (a) => `<div class="${h["icon-content"]}">${a}</div>`,
      py = (a, c) => {
        let d = $u();
        if (d) {
          if (!c.imageUrl) {
            Ce(d);
            return;
          }
          me(d, ""),
            d.setAttribute("src", c.imageUrl),
            d.setAttribute("alt", c.imageAlt || ""),
            un(d, "width", c.imageWidth),
            un(d, "height", c.imageHeight),
            (d.className = h.image),
            Fe(d, c, "image");
        }
      },
      _a = !1,
      Ju = 0,
      ed = 0,
      td = 0,
      nd = 0,
      gy = (a) => {
        a.addEventListener("mousedown", Yo),
          document.body.addEventListener("mousemove", Qo),
          a.addEventListener("mouseup", Ko),
          a.addEventListener("touchstart", Yo),
          document.body.addEventListener("touchmove", Qo),
          a.addEventListener("touchend", Ko);
      },
      my = (a) => {
        a.removeEventListener("mousedown", Yo),
          document.body.removeEventListener("mousemove", Qo),
          a.removeEventListener("mouseup", Ko),
          a.removeEventListener("touchstart", Yo),
          document.body.removeEventListener("touchmove", Qo),
          a.removeEventListener("touchend", Ko);
      },
      Yo = (a) => {
        let c = q();
        if (a.target === c || Pn().contains(a.target)) {
          _a = !0;
          let d = rd(a);
          (Ju = d.clientX),
            (ed = d.clientY),
            (td = parseInt(c.style.insetInlineStart) || 0),
            (nd = parseInt(c.style.insetBlockStart) || 0),
            z(c, "swal2-dragging");
        }
      },
      Qo = (a) => {
        let c = q();
        if (_a) {
          let { clientX: d, clientY: p } = rd(a);
          (c.style.insetInlineStart = `${td + (d - Ju)}px`),
            (c.style.insetBlockStart = `${nd + (p - ed)}px`);
        }
      },
      Ko = () => {
        let a = q();
        (_a = !1), Ke(a, "swal2-dragging");
      },
      rd = (a) => {
        let c = 0,
          d = 0;
        return (
          a.type.startsWith("mouse")
            ? ((c = a.clientX), (d = a.clientY))
            : a.type.startsWith("touch") &&
              ((c = a.touches[0].clientX), (d = a.touches[0].clientY)),
          { clientX: c, clientY: d }
        );
      },
      vy = (a, c) => {
        let d = be(),
          p = q();
        if (!(!d || !p)) {
          if (c.toast) {
            un(d, "width", c.width), (p.style.width = "100%");
            let m = kn();
            m && p.insertBefore(m, Pn());
          } else un(p, "width", c.width);
          un(p, "padding", c.padding),
            c.color && (p.style.color = c.color),
            c.background && (p.style.background = c.background),
            Ce(zo()),
            yy(p, c),
            c.draggable && !c.toast ? gy(p) : my(p);
        }
      },
      yy = (a, c) => {
        let d = c.showClass || {};
        (a.className = `${h.popup} ${Se(a) ? d.popup : ""}`),
          c.toast
            ? (z([document.documentElement, document.body], h["toast-shown"]),
              z(a, h.toast))
            : z(a, h.modal),
          Fe(a, c, "popup"),
          typeof c.customClass == "string" && z(a, c.customClass),
          c.icon && z(a, h[`icon-${c.icon}`]);
      },
      wy = (a, c) => {
        let d = ma();
        if (!d) return;
        let { progressSteps: p, currentProgressStep: m } = c;
        if (!p || p.length === 0 || m === void 0) {
          Ce(d);
          return;
        }
        me(d),
          (d.textContent = ""),
          m >= p.length &&
            E(
              "Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)"
            ),
          p.forEach((C, F) => {
            let B = Dy(C);
            if (
              (d.appendChild(B),
              F === m && z(B, h["active-progress-step"]),
              F !== p.length - 1)
            ) {
              let re = by(c);
              d.appendChild(re);
            }
          });
      },
      Dy = (a) => {
        let c = document.createElement("li");
        return z(c, h["progress-step"]), Pe(c, a), c;
      },
      by = (a) => {
        let c = document.createElement("li");
        return (
          z(c, h["progress-step-line"]),
          a.progressStepsDistance && un(c, "width", a.progressStepsDistance),
          c
        );
      },
      Cy = (a, c) => {
        let d = Uu();
        d &&
          (Da(d),
          jr(d, c.title || c.titleText, "block"),
          c.title && Ca(c.title, d),
          c.titleText && (d.innerText = c.titleText),
          Fe(d, c, "title"));
      },
      od = (a, c) => {
        vy(a, c),
          Kv(a, c),
          wy(a, c),
          ly(a, c),
          py(a, c),
          Cy(a, c),
          Qv(a, c),
          ay(a, c),
          Wv(a, c),
          cy(a, c);
        let d = q();
        typeof c.didRender == "function" && d && c.didRender(d),
          s.eventEmitter.emit("didRender", d);
      },
      Ey = () => Se(q()),
      id = () => {
        var a;
        return (a = at()) === null || a === void 0 ? void 0 : a.click();
      },
      Iy = () => {
        var a;
        return (a = ln()) === null || a === void 0 ? void 0 : a.click();
      },
      _y = () => {
        var a;
        return (a = Fn()) === null || a === void 0 ? void 0 : a.click();
      },
      Ln = Object.freeze({
        cancel: "cancel",
        backdrop: "backdrop",
        close: "close",
        esc: "esc",
        timer: "timer",
      }),
      sd = (a) => {
        a.keydownTarget &&
          a.keydownHandlerAdded &&
          (a.keydownTarget.removeEventListener("keydown", a.keydownHandler, {
            capture: a.keydownListenerCapture,
          }),
          (a.keydownHandlerAdded = !1));
      },
      My = (a, c, d) => {
        sd(a),
          c.toast ||
            ((a.keydownHandler = (p) => xy(c, p, d)),
            (a.keydownTarget = c.keydownListenerCapture ? window : q()),
            (a.keydownListenerCapture = c.keydownListenerCapture),
            a.keydownTarget.addEventListener("keydown", a.keydownHandler, {
              capture: a.keydownListenerCapture,
            }),
            (a.keydownHandlerAdded = !0));
      },
      Ma = (a, c) => {
        var d;
        let p = ya();
        if (p.length) {
          (a = a + c),
            a === p.length ? (a = 0) : a === -1 && (a = p.length - 1),
            p[a].focus();
          return;
        }
        (d = q()) === null || d === void 0 || d.focus();
      },
      ad = ["ArrowRight", "ArrowDown"],
      Sy = ["ArrowLeft", "ArrowUp"],
      xy = (a, c, d) => {
        a &&
          (c.isComposing ||
            c.keyCode === 229 ||
            (a.stopKeydownPropagation && c.stopPropagation(),
            c.key === "Enter"
              ? Ty(c, a)
              : c.key === "Tab"
              ? Ay(c)
              : [...ad, ...Sy].includes(c.key)
              ? Ny(c.key)
              : c.key === "Escape" && Ry(c, a, d)));
      },
      Ty = (a, c) => {
        if (!he(c.allowEnterKey)) return;
        let d = Wo(q(), c.input);
        if (
          a.target &&
          d &&
          a.target instanceof HTMLElement &&
          a.target.outerHTML === d.outerHTML
        ) {
          if (["textarea", "file"].includes(c.input)) return;
          id(), a.preventDefault();
        }
      },
      Ay = (a) => {
        let c = a.target,
          d = ya(),
          p = -1;
        for (let m = 0; m < d.length; m++)
          if (c === d[m]) {
            p = m;
            break;
          }
        a.shiftKey ? Ma(p, -1) : Ma(p, 1),
          a.stopPropagation(),
          a.preventDefault();
      },
      Ny = (a) => {
        let c = Vr(),
          d = at(),
          p = ln(),
          m = Fn();
        if (!c || !d || !p || !m) return;
        let C = [d, p, m];
        if (
          document.activeElement instanceof HTMLElement &&
          !C.includes(document.activeElement)
        )
          return;
        let F = ad.includes(a)
            ? "nextElementSibling"
            : "previousElementSibling",
          B = document.activeElement;
        if (B) {
          for (let re = 0; re < c.children.length; re++) {
            if (((B = B[F]), !B)) return;
            if (B instanceof HTMLButtonElement && Se(B)) break;
          }
          B instanceof HTMLButtonElement && B.focus();
        }
      },
      Ry = (a, c, d) => {
        he(c.allowEscapeKey) && (a.preventDefault(), d(Ln.esc));
      };
    var Vn = {
      swalPromiseResolve: new WeakMap(),
      swalPromiseReject: new WeakMap(),
    };
    let Oy = () => {
        let a = be();
        Array.from(document.body.children).forEach((d) => {
          d.contains(a) ||
            (d.hasAttribute("aria-hidden") &&
              d.setAttribute(
                "data-previous-aria-hidden",
                d.getAttribute("aria-hidden") || ""
              ),
            d.setAttribute("aria-hidden", "true"));
        });
      },
      cd = () => {
        Array.from(document.body.children).forEach((c) => {
          c.hasAttribute("data-previous-aria-hidden")
            ? (c.setAttribute(
                "aria-hidden",
                c.getAttribute("data-previous-aria-hidden") || ""
              ),
              c.removeAttribute("data-previous-aria-hidden"))
            : c.removeAttribute("aria-hidden");
        });
      },
      ld = typeof window < "u" && !!window.GestureEvent,
      Py = () => {
        if (ld && !Dt(document.body, h.iosfix)) {
          let a = document.body.scrollTop;
          (document.body.style.top = `${a * -1}px`),
            z(document.body, h.iosfix),
            Fy();
        }
      },
      Fy = () => {
        let a = be();
        if (!a) return;
        let c;
        (a.ontouchstart = (d) => {
          c = ky(d);
        }),
          (a.ontouchmove = (d) => {
            c && (d.preventDefault(), d.stopPropagation());
          });
      },
      ky = (a) => {
        let c = a.target,
          d = be(),
          p = ga();
        return !d || !p || Ly(a) || Vy(a)
          ? !1
          : c === d ||
              (!Wu(d) &&
                c instanceof HTMLElement &&
                c.tagName !== "INPUT" &&
                c.tagName !== "TEXTAREA" &&
                !(Wu(p) && p.contains(c)));
      },
      Ly = (a) =>
        a.touches && a.touches.length && a.touches[0].touchType === "stylus",
      Vy = (a) => a.touches && a.touches.length > 1,
      jy = () => {
        if (Dt(document.body, h.iosfix)) {
          let a = parseInt(document.body.style.top, 10);
          Ke(document.body, h.iosfix),
            (document.body.style.top = ""),
            (document.body.scrollTop = a * -1);
        }
      },
      By = () => {
        let a = document.createElement("div");
        (a.className = h["scrollbar-measure"]), document.body.appendChild(a);
        let c = a.getBoundingClientRect().width - a.clientWidth;
        return document.body.removeChild(a), c;
      },
      jn = null,
      Uy = (a) => {
        jn === null &&
          (document.body.scrollHeight > window.innerHeight || a === "scroll") &&
          ((jn = parseInt(
            window
              .getComputedStyle(document.body)
              .getPropertyValue("padding-right")
          )),
          (document.body.style.paddingRight = `${jn + By()}px`));
      },
      $y = () => {
        jn !== null &&
          ((document.body.style.paddingRight = `${jn}px`), (jn = null));
      };
    function ud(a, c, d, p) {
      qo() ? fd(a, p) : (u(d).then(() => fd(a, p)), sd(s)),
        ld
          ? (c.setAttribute("style", "display:none !important"),
            c.removeAttribute("class"),
            (c.innerHTML = ""))
          : c.remove(),
        wa() && ($y(), jy(), cd()),
        Hy();
    }
    function Hy() {
      Ke(
        [document.documentElement, document.body],
        [h.shown, h["height-auto"], h["no-backdrop"], h["toast-shown"]]
      );
    }
    function Pt(a) {
      a = Gy(a);
      let c = Vn.swalPromiseResolve.get(this),
        d = zy(this);
      this.isAwaitingPromise ? a.isDismissed || (Ur(this), c(a)) : d && c(a);
    }
    let zy = (a) => {
      let c = q();
      if (!c) return !1;
      let d = K.innerParams.get(a);
      if (!d || Dt(c, d.hideClass.popup)) return !1;
      Ke(c, d.showClass.popup), z(c, d.hideClass.popup);
      let p = be();
      return (
        Ke(p, d.showClass.backdrop), z(p, d.hideClass.backdrop), qy(a, c, d), !0
      );
    };
    function dd(a) {
      let c = Vn.swalPromiseReject.get(this);
      Ur(this), c && c(a);
    }
    let Ur = (a) => {
        a.isAwaitingPromise &&
          (delete a.isAwaitingPromise, K.innerParams.get(a) || a._destroy());
      },
      Gy = (a) =>
        typeof a > "u"
          ? { isConfirmed: !1, isDenied: !1, isDismissed: !0 }
          : Object.assign(
              { isConfirmed: !1, isDenied: !1, isDismissed: !1 },
              a
            ),
      qy = (a, c, d) => {
        var p;
        let m = be(),
          C = Zu(c);
        typeof d.willClose == "function" && d.willClose(c),
          (p = s.eventEmitter) === null ||
            p === void 0 ||
            p.emit("willClose", c),
          C
            ? Wy(a, c, m, d.returnFocus, d.didClose)
            : ud(a, m, d.returnFocus, d.didClose);
      },
      Wy = (a, c, d, p, m) => {
        s.swalCloseEventFinishedCallback = ud.bind(null, a, d, p, m);
        let C = function (F) {
          if (F.target === c) {
            var B;
            (B = s.swalCloseEventFinishedCallback) === null ||
              B === void 0 ||
              B.call(s),
              delete s.swalCloseEventFinishedCallback,
              c.removeEventListener("animationend", C),
              c.removeEventListener("transitionend", C);
          }
        };
        c.addEventListener("animationend", C),
          c.addEventListener("transitionend", C);
      },
      fd = (a, c) => {
        setTimeout(() => {
          var d;
          typeof c == "function" && c.bind(a.params)(),
            (d = s.eventEmitter) === null || d === void 0 || d.emit("didClose"),
            a._destroy && a._destroy();
        });
      },
      Bn = (a) => {
        let c = q();
        if ((c || new ri(), (c = q()), !c)) return;
        let d = kn();
        qo() ? Ce(Pn()) : Zy(c, a),
          me(d),
          c.setAttribute("data-loading", "true"),
          c.setAttribute("aria-busy", "true"),
          c.focus();
      },
      Zy = (a, c) => {
        let d = Vr(),
          p = kn();
        !d ||
          !p ||
          (!c && Se(at()) && (c = at()),
          me(d),
          c &&
            (Ce(c),
            p.setAttribute("data-button-to-replace", c.className),
            d.insertBefore(p, c)),
          z([a, d], h.loading));
      },
      Yy = (a, c) => {
        c.input === "select" || c.input === "radio"
          ? ew(a, c)
          : ["text", "email", "number", "tel", "textarea"].some(
              (d) => d === c.input
            ) &&
            (ne(c.inputValue) || cn(c.inputValue)) &&
            (Bn(at()), tw(a, c));
      },
      Qy = (a, c) => {
        let d = a.getInput();
        if (!d) return null;
        switch (c.input) {
          case "checkbox":
            return Ky(d);
          case "radio":
            return Xy(d);
          case "file":
            return Jy(d);
          default:
            return c.inputAutoTrim ? d.value.trim() : d.value;
        }
      },
      Ky = (a) => (a.checked ? 1 : 0),
      Xy = (a) => (a.checked ? a.value : null),
      Jy = (a) =>
        a.files && a.files.length
          ? a.getAttribute("multiple") !== null
            ? a.files
            : a.files[0]
          : null,
      ew = (a, c) => {
        let d = q();
        if (!d) return;
        let p = (m) => {
          c.input === "select"
            ? nw(d, Xo(m), c)
            : c.input === "radio" && rw(d, Xo(m), c);
        };
        ne(c.inputOptions) || cn(c.inputOptions)
          ? (Bn(at()),
            Ee(c.inputOptions).then((m) => {
              a.hideLoading(), p(m);
            }))
          : typeof c.inputOptions == "object"
          ? p(c.inputOptions)
          : x(
              `Unexpected type of inputOptions! Expected object, Map or Promise, got ${typeof c.inputOptions}`
            );
      },
      tw = (a, c) => {
        let d = a.getInput();
        d &&
          (Ce(d),
          Ee(c.inputValue)
            .then((p) => {
              (d.value =
                c.input === "number" ? `${parseFloat(p) || 0}` : `${p}`),
                me(d),
                d.focus(),
                a.hideLoading();
            })
            .catch((p) => {
              x(`Error in inputValue promise: ${p}`),
                (d.value = ""),
                me(d),
                d.focus(),
                a.hideLoading();
            }));
      };
    function nw(a, c, d) {
      let p = Ot(a, h.select);
      if (!p) return;
      let m = (C, F, B) => {
        let re = document.createElement("option");
        (re.value = B),
          Pe(re, F),
          (re.selected = hd(B, d.inputValue)),
          C.appendChild(re);
      };
      c.forEach((C) => {
        let F = C[0],
          B = C[1];
        if (Array.isArray(B)) {
          let re = document.createElement("optgroup");
          (re.label = F),
            (re.disabled = !1),
            p.appendChild(re),
            B.forEach(($n) => m(re, $n[1], $n[0]));
        } else m(p, B, F);
      }),
        p.focus();
    }
    function rw(a, c, d) {
      let p = Ot(a, h.radio);
      if (!p) return;
      c.forEach((C) => {
        let F = C[0],
          B = C[1],
          re = document.createElement("input"),
          $n = document.createElement("label");
        (re.type = "radio"),
          (re.name = h.radio),
          (re.value = F),
          hd(F, d.inputValue) && (re.checked = !0);
        let Na = document.createElement("span");
        Pe(Na, B),
          (Na.className = h.label),
          $n.appendChild(re),
          $n.appendChild(Na),
          p.appendChild($n);
      });
      let m = p.querySelectorAll("input");
      m.length && m[0].focus();
    }
    let Xo = (a) => {
        let c = [];
        return (
          a instanceof Map
            ? a.forEach((d, p) => {
                let m = d;
                typeof m == "object" && (m = Xo(m)), c.push([p, m]);
              })
            : Object.keys(a).forEach((d) => {
                let p = a[d];
                typeof p == "object" && (p = Xo(p)), c.push([d, p]);
              }),
          c
        );
      },
      hd = (a, c) => !!c && c.toString() === a.toString(),
      ow = (a) => {
        let c = K.innerParams.get(a);
        a.disableButtons(), c.input ? pd(a, "confirm") : xa(a, !0);
      },
      iw = (a) => {
        let c = K.innerParams.get(a);
        a.disableButtons(),
          c.returnInputValueOnDeny ? pd(a, "deny") : Sa(a, !1);
      },
      sw = (a, c) => {
        a.disableButtons(), c(Ln.cancel);
      },
      pd = (a, c) => {
        let d = K.innerParams.get(a);
        if (!d.input) {
          x(
            `The "input" parameter is needed to be set when using returnInputValueOn${I(
              c
            )}`
          );
          return;
        }
        let p = a.getInput(),
          m = Qy(a, d);
        d.inputValidator
          ? aw(a, m, c)
          : p && !p.checkValidity()
          ? (a.enableButtons(),
            a.showValidationMessage(d.validationMessage || p.validationMessage))
          : c === "deny"
          ? Sa(a, m)
          : xa(a, m);
      },
      aw = (a, c, d) => {
        let p = K.innerParams.get(a);
        a.disableInput(),
          Promise.resolve()
            .then(() => Ee(p.inputValidator(c, p.validationMessage)))
            .then((C) => {
              a.enableButtons(),
                a.enableInput(),
                C
                  ? a.showValidationMessage(C)
                  : d === "deny"
                  ? Sa(a, c)
                  : xa(a, c);
            });
      },
      Sa = (a, c) => {
        let d = K.innerParams.get(a || void 0);
        d.showLoaderOnDeny && Bn(ln()),
          d.preDeny
            ? ((a.isAwaitingPromise = !0),
              Promise.resolve()
                .then(() => Ee(d.preDeny(c, d.validationMessage)))
                .then((m) => {
                  m === !1
                    ? (a.hideLoading(), Ur(a))
                    : a.close({ isDenied: !0, value: typeof m > "u" ? c : m });
                })
                .catch((m) => md(a || void 0, m)))
            : a.close({ isDenied: !0, value: c });
      },
      gd = (a, c) => {
        a.close({ isConfirmed: !0, value: c });
      },
      md = (a, c) => {
        a.rejectPromise(c);
      },
      xa = (a, c) => {
        let d = K.innerParams.get(a || void 0);
        d.showLoaderOnConfirm && Bn(),
          d.preConfirm
            ? (a.resetValidationMessage(),
              (a.isAwaitingPromise = !0),
              Promise.resolve()
                .then(() => Ee(d.preConfirm(c, d.validationMessage)))
                .then((m) => {
                  Se(zo()) || m === !1
                    ? (a.hideLoading(), Ur(a))
                    : gd(a, typeof m > "u" ? c : m);
                })
                .catch((m) => md(a || void 0, m)))
            : gd(a, c);
      };
    function Jo() {
      let a = K.innerParams.get(this);
      if (!a) return;
      let c = K.domCache.get(this);
      Ce(c.loader),
        qo() ? a.icon && me(Pn()) : cw(c),
        Ke([c.popup, c.actions], h.loading),
        c.popup.removeAttribute("aria-busy"),
        c.popup.removeAttribute("data-loading"),
        (c.confirmButton.disabled = !1),
        (c.denyButton.disabled = !1),
        (c.cancelButton.disabled = !1);
    }
    let cw = (a) => {
      let c = a.popup.getElementsByClassName(
        a.loader.getAttribute("data-button-to-replace")
      );
      c.length ? me(c[0], "inline-block") : Fv() && Ce(a.actions);
    };
    function vd() {
      let a = K.innerParams.get(this),
        c = K.domCache.get(this);
      return c ? Wo(c.popup, a.input) : null;
    }
    function yd(a, c, d) {
      let p = K.domCache.get(a);
      c.forEach((m) => {
        p[m].disabled = d;
      });
    }
    function wd(a, c) {
      let d = q();
      if (!(!d || !a))
        if (a.type === "radio") {
          let p = d.querySelectorAll(`[name="${h.radio}"]`);
          for (let m = 0; m < p.length; m++) p[m].disabled = c;
        } else a.disabled = c;
    }
    function Dd() {
      yd(this, ["confirmButton", "denyButton", "cancelButton"], !1);
    }
    function bd() {
      yd(this, ["confirmButton", "denyButton", "cancelButton"], !0);
    }
    function Cd() {
      wd(this.getInput(), !1);
    }
    function Ed() {
      wd(this.getInput(), !0);
    }
    function Id(a) {
      let c = K.domCache.get(this),
        d = K.innerParams.get(this);
      Pe(c.validationMessage, a),
        (c.validationMessage.className = h["validation-message"]),
        d.customClass &&
          d.customClass.validationMessage &&
          z(c.validationMessage, d.customClass.validationMessage),
        me(c.validationMessage);
      let p = this.getInput();
      p &&
        (p.setAttribute("aria-invalid", "true"),
        p.setAttribute("aria-describedby", h["validation-message"]),
        zu(p),
        z(p, h.inputerror));
    }
    function _d() {
      let a = K.domCache.get(this);
      a.validationMessage && Ce(a.validationMessage);
      let c = this.getInput();
      c &&
        (c.removeAttribute("aria-invalid"),
        c.removeAttribute("aria-describedby"),
        Ke(c, h.inputerror));
    }
    let Un = {
        title: "",
        titleText: "",
        text: "",
        html: "",
        footer: "",
        icon: void 0,
        iconColor: void 0,
        iconHtml: void 0,
        template: void 0,
        toast: !1,
        draggable: !1,
        animation: !0,
        showClass: {
          popup: "swal2-show",
          backdrop: "swal2-backdrop-show",
          icon: "swal2-icon-show",
        },
        hideClass: {
          popup: "swal2-hide",
          backdrop: "swal2-backdrop-hide",
          icon: "swal2-icon-hide",
        },
        customClass: {},
        target: "body",
        color: void 0,
        backdrop: !0,
        heightAuto: !0,
        allowOutsideClick: !0,
        allowEscapeKey: !0,
        allowEnterKey: !0,
        stopKeydownPropagation: !0,
        keydownListenerCapture: !1,
        showConfirmButton: !0,
        showDenyButton: !1,
        showCancelButton: !1,
        preConfirm: void 0,
        preDeny: void 0,
        confirmButtonText: "OK",
        confirmButtonAriaLabel: "",
        confirmButtonColor: void 0,
        denyButtonText: "No",
        denyButtonAriaLabel: "",
        denyButtonColor: void 0,
        cancelButtonText: "Cancel",
        cancelButtonAriaLabel: "",
        cancelButtonColor: void 0,
        buttonsStyling: !0,
        reverseButtons: !1,
        focusConfirm: !0,
        focusDeny: !1,
        focusCancel: !1,
        returnFocus: !0,
        showCloseButton: !1,
        closeButtonHtml: "&times;",
        closeButtonAriaLabel: "Close this dialog",
        loaderHtml: "",
        showLoaderOnConfirm: !1,
        showLoaderOnDeny: !1,
        imageUrl: void 0,
        imageWidth: void 0,
        imageHeight: void 0,
        imageAlt: "",
        timer: void 0,
        timerProgressBar: !1,
        width: void 0,
        padding: void 0,
        background: void 0,
        input: void 0,
        inputPlaceholder: "",
        inputLabel: "",
        inputValue: "",
        inputOptions: {},
        inputAutoFocus: !0,
        inputAutoTrim: !0,
        inputAttributes: {},
        inputValidator: void 0,
        returnInputValueOnDeny: !1,
        validationMessage: void 0,
        grow: !1,
        position: "center",
        progressSteps: [],
        currentProgressStep: void 0,
        progressStepsDistance: void 0,
        willOpen: void 0,
        didOpen: void 0,
        didRender: void 0,
        willClose: void 0,
        didClose: void 0,
        didDestroy: void 0,
        scrollbarPadding: !0,
      },
      lw = [
        "allowEscapeKey",
        "allowOutsideClick",
        "background",
        "buttonsStyling",
        "cancelButtonAriaLabel",
        "cancelButtonColor",
        "cancelButtonText",
        "closeButtonAriaLabel",
        "closeButtonHtml",
        "color",
        "confirmButtonAriaLabel",
        "confirmButtonColor",
        "confirmButtonText",
        "currentProgressStep",
        "customClass",
        "denyButtonAriaLabel",
        "denyButtonColor",
        "denyButtonText",
        "didClose",
        "didDestroy",
        "draggable",
        "footer",
        "hideClass",
        "html",
        "icon",
        "iconColor",
        "iconHtml",
        "imageAlt",
        "imageHeight",
        "imageUrl",
        "imageWidth",
        "preConfirm",
        "preDeny",
        "progressSteps",
        "returnFocus",
        "reverseButtons",
        "showCancelButton",
        "showCloseButton",
        "showConfirmButton",
        "showDenyButton",
        "text",
        "title",
        "titleText",
        "willClose",
      ],
      uw = { allowEnterKey: void 0 },
      dw = [
        "allowOutsideClick",
        "allowEnterKey",
        "backdrop",
        "draggable",
        "focusConfirm",
        "focusDeny",
        "focusCancel",
        "returnFocus",
        "heightAuto",
        "keydownListenerCapture",
      ],
      Md = (a) => Object.prototype.hasOwnProperty.call(Un, a),
      Sd = (a) => lw.indexOf(a) !== -1,
      xd = (a) => uw[a],
      fw = (a) => {
        Md(a) || E(`Unknown parameter "${a}"`);
      },
      hw = (a) => {
        dw.includes(a) && E(`The parameter "${a}" is incompatible with toasts`);
      },
      pw = (a) => {
        let c = xd(a);
        c && ce(a, c);
      },
      gw = (a) => {
        a.backdrop === !1 &&
          a.allowOutsideClick &&
          E(
            '"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`'
          );
        for (let c in a) fw(c), a.toast && hw(c), pw(c);
      };
    function Td(a) {
      let c = q(),
        d = K.innerParams.get(this);
      if (!c || Dt(c, d.hideClass.popup)) {
        E(
          "You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup."
        );
        return;
      }
      let p = mw(a),
        m = Object.assign({}, d, p);
      od(this, m),
        K.innerParams.set(this, m),
        Object.defineProperties(this, {
          params: {
            value: Object.assign({}, this.params, a),
            writable: !1,
            enumerable: !0,
          },
        });
    }
    let mw = (a) => {
      let c = {};
      return (
        Object.keys(a).forEach((d) => {
          Sd(d) ? (c[d] = a[d]) : E(`Invalid parameter to update: ${d}`);
        }),
        c
      );
    };
    function Ad() {
      let a = K.domCache.get(this),
        c = K.innerParams.get(this);
      if (!c) {
        Nd(this);
        return;
      }
      a.popup &&
        s.swalCloseEventFinishedCallback &&
        (s.swalCloseEventFinishedCallback(),
        delete s.swalCloseEventFinishedCallback),
        typeof c.didDestroy == "function" && c.didDestroy(),
        s.eventEmitter.emit("didDestroy"),
        vw(this);
    }
    let vw = (a) => {
        Nd(a),
          delete a.params,
          delete s.keydownHandler,
          delete s.keydownTarget,
          delete s.currentInstance;
      },
      Nd = (a) => {
        a.isAwaitingPromise
          ? (Ta(K, a), (a.isAwaitingPromise = !0))
          : (Ta(Vn, a),
            Ta(K, a),
            delete a.isAwaitingPromise,
            delete a.disableButtons,
            delete a.enableButtons,
            delete a.getInput,
            delete a.disableInput,
            delete a.enableInput,
            delete a.hideLoading,
            delete a.disableLoading,
            delete a.showValidationMessage,
            delete a.resetValidationMessage,
            delete a.close,
            delete a.closePopup,
            delete a.closeModal,
            delete a.closeToast,
            delete a.rejectPromise,
            delete a.update,
            delete a._destroy);
      },
      Ta = (a, c) => {
        for (let d in a) a[d].delete(c);
      };
    var yw = Object.freeze({
      __proto__: null,
      _destroy: Ad,
      close: Pt,
      closeModal: Pt,
      closePopup: Pt,
      closeToast: Pt,
      disableButtons: bd,
      disableInput: Ed,
      disableLoading: Jo,
      enableButtons: Dd,
      enableInput: Cd,
      getInput: vd,
      handleAwaitingPromise: Ur,
      hideLoading: Jo,
      rejectPromise: dd,
      resetValidationMessage: _d,
      showValidationMessage: Id,
      update: Td,
    });
    let ww = (a, c, d) => {
        a.toast ? Dw(a, c, d) : (Cw(c), Ew(c), Iw(a, c, d));
      },
      Dw = (a, c, d) => {
        c.popup.onclick = () => {
          (a && (bw(a) || a.timer || a.input)) || d(Ln.close);
        };
      },
      bw = (a) =>
        !!(
          a.showConfirmButton ||
          a.showDenyButton ||
          a.showCancelButton ||
          a.showCloseButton
        ),
      ei = !1,
      Cw = (a) => {
        a.popup.onmousedown = () => {
          a.container.onmouseup = function (c) {
            (a.container.onmouseup = () => {}),
              c.target === a.container && (ei = !0);
          };
        };
      },
      Ew = (a) => {
        a.container.onmousedown = (c) => {
          c.target === a.container && c.preventDefault(),
            (a.popup.onmouseup = function (d) {
              (a.popup.onmouseup = () => {}),
                (d.target === a.popup ||
                  (d.target instanceof HTMLElement &&
                    a.popup.contains(d.target))) &&
                  (ei = !0);
            });
        };
      },
      Iw = (a, c, d) => {
        c.container.onclick = (p) => {
          if (ei) {
            ei = !1;
            return;
          }
          p.target === c.container && he(a.allowOutsideClick) && d(Ln.backdrop);
        };
      },
      _w = (a) => typeof a == "object" && a.jquery,
      Rd = (a) => a instanceof Element || _w(a),
      Mw = (a) => {
        let c = {};
        return (
          typeof a[0] == "object" && !Rd(a[0])
            ? Object.assign(c, a[0])
            : ["title", "html", "icon"].forEach((d, p) => {
                let m = a[p];
                typeof m == "string" || Rd(m)
                  ? (c[d] = m)
                  : m !== void 0 &&
                    x(
                      `Unexpected type of ${d}! Expected "string" or "Element", got ${typeof m}`
                    );
              }),
          c
        );
      };
    function Sw() {
      for (var a = arguments.length, c = new Array(a), d = 0; d < a; d++)
        c[d] = arguments[d];
      return new this(...c);
    }
    function xw(a) {
      class c extends this {
        _main(p, m) {
          return super._main(p, Object.assign({}, a, m));
        }
      }
      return c;
    }
    let Tw = () => s.timeout && s.timeout.getTimerLeft(),
      Od = () => {
        if (s.timeout) return kv(), s.timeout.stop();
      },
      Pd = () => {
        if (s.timeout) {
          let a = s.timeout.start();
          return ba(a), a;
        }
      },
      Aw = () => {
        let a = s.timeout;
        return a && (a.running ? Od() : Pd());
      },
      Nw = (a) => {
        if (s.timeout) {
          let c = s.timeout.increase(a);
          return ba(c, !0), c;
        }
      },
      Rw = () => !!(s.timeout && s.timeout.isRunning()),
      Fd = !1,
      Aa = {};
    function Ow() {
      let a =
        arguments.length > 0 && arguments[0] !== void 0
          ? arguments[0]
          : "data-swal-template";
      (Aa[a] = this),
        Fd || (document.body.addEventListener("click", Pw), (Fd = !0));
    }
    let Pw = (a) => {
      for (let c = a.target; c && c !== document; c = c.parentNode)
        for (let d in Aa) {
          let p = c.getAttribute(d);
          if (p) {
            Aa[d].fire({ template: p });
            return;
          }
        }
    };
    class Fw {
      constructor() {
        this.events = {};
      }
      _getHandlersByEventName(c) {
        return (
          typeof this.events[c] > "u" && (this.events[c] = []), this.events[c]
        );
      }
      on(c, d) {
        let p = this._getHandlersByEventName(c);
        p.includes(d) || p.push(d);
      }
      once(c, d) {
        var p = this;
        let m = function () {
          p.removeListener(c, m);
          for (var C = arguments.length, F = new Array(C), B = 0; B < C; B++)
            F[B] = arguments[B];
          d.apply(p, F);
        };
        this.on(c, m);
      }
      emit(c) {
        for (
          var d = arguments.length, p = new Array(d > 1 ? d - 1 : 0), m = 1;
          m < d;
          m++
        )
          p[m - 1] = arguments[m];
        this._getHandlersByEventName(c).forEach((C) => {
          try {
            C.apply(this, p);
          } catch (F) {
            console.error(F);
          }
        });
      }
      removeListener(c, d) {
        let p = this._getHandlersByEventName(c),
          m = p.indexOf(d);
        m > -1 && p.splice(m, 1);
      }
      removeAllListeners(c) {
        this.events[c] !== void 0 && (this.events[c].length = 0);
      }
      reset() {
        this.events = {};
      }
    }
    s.eventEmitter = new Fw();
    var kw = Object.freeze({
      __proto__: null,
      argsToParams: Mw,
      bindClickHandler: Ow,
      clickCancel: _y,
      clickConfirm: id,
      clickDeny: Iy,
      enableLoading: Bn,
      fire: Sw,
      getActions: Vr,
      getCancelButton: Fn,
      getCloseButton: va,
      getConfirmButton: at,
      getContainer: be,
      getDenyButton: ln,
      getFocusableElements: ya,
      getFooter: Hu,
      getHtmlContainer: ga,
      getIcon: Pn,
      getIconContent: Av,
      getImage: $u,
      getInputLabel: Nv,
      getLoader: kn,
      getPopup: q,
      getProgressSteps: ma,
      getTimerLeft: Tw,
      getTimerProgressBar: Go,
      getTitle: Uu,
      getValidationMessage: zo,
      increaseTimer: Nw,
      isDeprecatedParameter: xd,
      isLoading: Ov,
      isTimerRunning: Rw,
      isUpdatableParameter: Sd,
      isValidParameter: Md,
      isVisible: Ey,
      mixin: xw,
      off: (a, c) => {
        if (!a) {
          s.eventEmitter.reset();
          return;
        }
        c
          ? s.eventEmitter.removeListener(a, c)
          : s.eventEmitter.removeAllListeners(a);
      },
      on: (a, c) => {
        s.eventEmitter.on(a, c);
      },
      once: (a, c) => {
        s.eventEmitter.once(a, c);
      },
      resumeTimer: Pd,
      showLoading: Bn,
      stopTimer: Od,
      toggleTimer: Aw,
    });
    class Lw {
      constructor(c, d) {
        (this.callback = c),
          (this.remaining = d),
          (this.running = !1),
          this.start();
      }
      start() {
        return (
          this.running ||
            ((this.running = !0),
            (this.started = new Date()),
            (this.id = setTimeout(this.callback, this.remaining))),
          this.remaining
        );
      }
      stop() {
        return (
          this.started &&
            this.running &&
            ((this.running = !1),
            clearTimeout(this.id),
            (this.remaining -= new Date().getTime() - this.started.getTime())),
          this.remaining
        );
      }
      increase(c) {
        let d = this.running;
        return (
          d && this.stop(),
          (this.remaining += c),
          d && this.start(),
          this.remaining
        );
      }
      getTimerLeft() {
        return this.running && (this.stop(), this.start()), this.remaining;
      }
      isRunning() {
        return this.running;
      }
    }
    let kd = ["swal-title", "swal-html", "swal-footer"],
      Vw = (a) => {
        let c =
          typeof a.template == "string"
            ? document.querySelector(a.template)
            : a.template;
        if (!c) return {};
        let d = c.content;
        return (
          qw(d),
          Object.assign(jw(d), Bw(d), Uw(d), $w(d), Hw(d), zw(d), Gw(d, kd))
        );
      },
      jw = (a) => {
        let c = {};
        return (
          Array.from(a.querySelectorAll("swal-param")).forEach((p) => {
            fn(p, ["name", "value"]);
            let m = p.getAttribute("name"),
              C = p.getAttribute("value");
            !m ||
              !C ||
              (typeof Un[m] == "boolean"
                ? (c[m] = C !== "false")
                : typeof Un[m] == "object"
                ? (c[m] = JSON.parse(C))
                : (c[m] = C));
          }),
          c
        );
      },
      Bw = (a) => {
        let c = {};
        return (
          Array.from(a.querySelectorAll("swal-function-param")).forEach((p) => {
            let m = p.getAttribute("name"),
              C = p.getAttribute("value");
            !m || !C || (c[m] = new Function(`return ${C}`)());
          }),
          c
        );
      },
      Uw = (a) => {
        let c = {};
        return (
          Array.from(a.querySelectorAll("swal-button")).forEach((p) => {
            fn(p, ["type", "color", "aria-label"]);
            let m = p.getAttribute("type");
            !m ||
              !["confirm", "cancel", "deny"].includes(m) ||
              ((c[`${m}ButtonText`] = p.innerHTML),
              (c[`show${I(m)}Button`] = !0),
              p.hasAttribute("color") &&
                (c[`${m}ButtonColor`] = p.getAttribute("color")),
              p.hasAttribute("aria-label") &&
                (c[`${m}ButtonAriaLabel`] = p.getAttribute("aria-label")));
          }),
          c
        );
      },
      $w = (a) => {
        let c = {},
          d = a.querySelector("swal-image");
        return (
          d &&
            (fn(d, ["src", "width", "height", "alt"]),
            d.hasAttribute("src") &&
              (c.imageUrl = d.getAttribute("src") || void 0),
            d.hasAttribute("width") &&
              (c.imageWidth = d.getAttribute("width") || void 0),
            d.hasAttribute("height") &&
              (c.imageHeight = d.getAttribute("height") || void 0),
            d.hasAttribute("alt") &&
              (c.imageAlt = d.getAttribute("alt") || void 0)),
          c
        );
      },
      Hw = (a) => {
        let c = {},
          d = a.querySelector("swal-icon");
        return (
          d &&
            (fn(d, ["type", "color"]),
            d.hasAttribute("type") && (c.icon = d.getAttribute("type")),
            d.hasAttribute("color") && (c.iconColor = d.getAttribute("color")),
            (c.iconHtml = d.innerHTML)),
          c
        );
      },
      zw = (a) => {
        let c = {},
          d = a.querySelector("swal-input");
        d &&
          (fn(d, ["type", "label", "placeholder", "value"]),
          (c.input = d.getAttribute("type") || "text"),
          d.hasAttribute("label") && (c.inputLabel = d.getAttribute("label")),
          d.hasAttribute("placeholder") &&
            (c.inputPlaceholder = d.getAttribute("placeholder")),
          d.hasAttribute("value") && (c.inputValue = d.getAttribute("value")));
        let p = Array.from(a.querySelectorAll("swal-input-option"));
        return (
          p.length &&
            ((c.inputOptions = {}),
            p.forEach((m) => {
              fn(m, ["value"]);
              let C = m.getAttribute("value");
              if (!C) return;
              let F = m.innerHTML;
              c.inputOptions[C] = F;
            })),
          c
        );
      },
      Gw = (a, c) => {
        let d = {};
        for (let p in c) {
          let m = c[p],
            C = a.querySelector(m);
          C && (fn(C, []), (d[m.replace(/^swal-/, "")] = C.innerHTML.trim()));
        }
        return d;
      },
      qw = (a) => {
        let c = kd.concat([
          "swal-param",
          "swal-function-param",
          "swal-button",
          "swal-image",
          "swal-icon",
          "swal-input",
          "swal-input-option",
        ]);
        Array.from(a.children).forEach((d) => {
          let p = d.tagName.toLowerCase();
          c.includes(p) || E(`Unrecognized element <${p}>`);
        });
      },
      fn = (a, c) => {
        Array.from(a.attributes).forEach((d) => {
          c.indexOf(d.name) === -1 &&
            E([
              `Unrecognized attribute "${
                d.name
              }" on <${a.tagName.toLowerCase()}>.`,
              `${
                c.length
                  ? `Allowed attributes are: ${c.join(", ")}`
                  : "To set the value, use HTML within the element."
              }`,
            ]);
        });
      },
      Ld = 10,
      Ww = (a) => {
        let c = be(),
          d = q();
        typeof a.willOpen == "function" && a.willOpen(d),
          s.eventEmitter.emit("willOpen", d);
        let m = window.getComputedStyle(document.body).overflowY;
        Qw(c, d, a),
          setTimeout(() => {
            Zw(c, d);
          }, Ld),
          wa() && (Yw(c, a.scrollbarPadding, m), Oy()),
          !qo() &&
            !s.previousActiveElement &&
            (s.previousActiveElement = document.activeElement),
          typeof a.didOpen == "function" && setTimeout(() => a.didOpen(d)),
          s.eventEmitter.emit("didOpen", d),
          Ke(c, h["no-transition"]);
      },
      ti = (a) => {
        let c = q();
        if (a.target !== c) return;
        let d = be();
        c.removeEventListener("animationend", ti),
          c.removeEventListener("transitionend", ti),
          (d.style.overflowY = "auto");
      },
      Zw = (a, c) => {
        Zu(c)
          ? ((a.style.overflowY = "hidden"),
            c.addEventListener("animationend", ti),
            c.addEventListener("transitionend", ti))
          : (a.style.overflowY = "auto");
      },
      Yw = (a, c, d) => {
        Py(),
          c && d !== "hidden" && Uy(d),
          setTimeout(() => {
            a.scrollTop = 0;
          });
      },
      Qw = (a, c, d) => {
        z(a, d.showClass.backdrop),
          d.animation
            ? (c.style.setProperty("opacity", "0", "important"),
              me(c, "grid"),
              setTimeout(() => {
                z(c, d.showClass.popup), c.style.removeProperty("opacity");
              }, Ld))
            : me(c, "grid"),
          z([document.documentElement, document.body], h.shown),
          d.heightAuto &&
            d.backdrop &&
            !d.toast &&
            z([document.documentElement, document.body], h["height-auto"]);
      };
    var Vd = {
      email: (a, c) =>
        /^[a-zA-Z0-9.+_'-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]+$/.test(a)
          ? Promise.resolve()
          : Promise.resolve(c || "Invalid email address"),
      url: (a, c) =>
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(
          a
        )
          ? Promise.resolve()
          : Promise.resolve(c || "Invalid URL"),
    };
    function Kw(a) {
      a.inputValidator ||
        (a.input === "email" && (a.inputValidator = Vd.email),
        a.input === "url" && (a.inputValidator = Vd.url));
    }
    function Xw(a) {
      (!a.target ||
        (typeof a.target == "string" && !document.querySelector(a.target)) ||
        (typeof a.target != "string" && !a.target.appendChild)) &&
        (E('Target parameter is not valid, defaulting to "body"'),
        (a.target = "body"));
    }
    function Jw(a) {
      Kw(a),
        a.showLoaderOnConfirm &&
          !a.preConfirm &&
          E(`showLoaderOnConfirm is set to true, but preConfirm is not defined.
showLoaderOnConfirm should be used together with preConfirm, see usage example:
https://sweetalert2.github.io/#ajax-request`),
        Xw(a),
        typeof a.title == "string" &&
          (a.title = a.title
            .split(
              `
`
            )
            .join("<br />")),
        zv(a);
    }
    let ct;
    var ni = new WeakMap();
    class ae {
      constructor() {
        if ((r(this, ni, void 0), typeof window > "u")) return;
        ct = this;
        for (var c = arguments.length, d = new Array(c), p = 0; p < c; p++)
          d[p] = arguments[p];
        let m = Object.freeze(this.constructor.argsToParams(d));
        (this.params = m),
          (this.isAwaitingPromise = !1),
          o(ni, this, this._main(ct.params));
      }
      _main(c) {
        let d =
          arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        if ((gw(Object.assign({}, d, c)), s.currentInstance)) {
          let C = Vn.swalPromiseResolve.get(s.currentInstance),
            { isAwaitingPromise: F } = s.currentInstance;
          s.currentInstance._destroy(),
            F || C({ isDismissed: !0 }),
            wa() && cd();
        }
        s.currentInstance = ct;
        let p = tD(c, d);
        Jw(p),
          Object.freeze(p),
          s.timeout && (s.timeout.stop(), delete s.timeout),
          clearTimeout(s.restoreFocusTimeout);
        let m = nD(ct);
        return od(ct, p), K.innerParams.set(ct, p), eD(ct, m, p);
      }
      then(c) {
        return n(ni, this).then(c);
      }
      finally(c) {
        return n(ni, this).finally(c);
      }
    }
    let eD = (a, c, d) =>
        new Promise((p, m) => {
          let C = (F) => {
            a.close({ isDismissed: !0, dismiss: F });
          };
          Vn.swalPromiseResolve.set(a, p),
            Vn.swalPromiseReject.set(a, m),
            (c.confirmButton.onclick = () => {
              ow(a);
            }),
            (c.denyButton.onclick = () => {
              iw(a);
            }),
            (c.cancelButton.onclick = () => {
              sw(a, C);
            }),
            (c.closeButton.onclick = () => {
              C(Ln.close);
            }),
            ww(d, c, C),
            My(s, d, C),
            Yy(a, d),
            Ww(d),
            rD(s, d, C),
            oD(c, d),
            setTimeout(() => {
              c.container.scrollTop = 0;
            });
        }),
      tD = (a, c) => {
        let d = Vw(a),
          p = Object.assign({}, Un, c, d, a);
        return (
          (p.showClass = Object.assign({}, Un.showClass, p.showClass)),
          (p.hideClass = Object.assign({}, Un.hideClass, p.hideClass)),
          p.animation === !1 &&
            ((p.showClass = { backdrop: "swal2-noanimation" }),
            (p.hideClass = {})),
          p
        );
      },
      nD = (a) => {
        let c = {
          popup: q(),
          container: be(),
          actions: Vr(),
          confirmButton: at(),
          denyButton: ln(),
          cancelButton: Fn(),
          loader: kn(),
          closeButton: va(),
          validationMessage: zo(),
          progressSteps: ma(),
        };
        return K.domCache.set(a, c), c;
      },
      rD = (a, c, d) => {
        let p = Go();
        Ce(p),
          c.timer &&
            ((a.timeout = new Lw(() => {
              d("timer"), delete a.timeout;
            }, c.timer)),
            c.timerProgressBar &&
              (me(p),
              Fe(p, c, "timerProgressBar"),
              setTimeout(() => {
                a.timeout && a.timeout.running && ba(c.timer);
              })));
      },
      oD = (a, c) => {
        if (!c.toast) {
          if (!he(c.allowEnterKey)) {
            ce("allowEnterKey"), aD();
            return;
          }
          iD(a) || sD(a, c) || Ma(-1, 1);
        }
      },
      iD = (a) => {
        let c = Array.from(a.popup.querySelectorAll("[autofocus]"));
        for (let d of c)
          if (d instanceof HTMLElement && Se(d)) return d.focus(), !0;
        return !1;
      },
      sD = (a, c) =>
        c.focusDeny && Se(a.denyButton)
          ? (a.denyButton.focus(), !0)
          : c.focusCancel && Se(a.cancelButton)
          ? (a.cancelButton.focus(), !0)
          : c.focusConfirm && Se(a.confirmButton)
          ? (a.confirmButton.focus(), !0)
          : !1,
      aD = () => {
        document.activeElement instanceof HTMLElement &&
          typeof document.activeElement.blur == "function" &&
          document.activeElement.blur();
      };
    if (
      typeof window < "u" &&
      /^ru\b/.test(navigator.language) &&
      location.host.match(/\.(ru|su|by|xn--p1ai)$/)
    ) {
      let a = new Date(),
        c = localStorage.getItem("swal-initiation");
      c
        ? (a.getTime() - Date.parse(c)) / (1e3 * 60 * 60 * 24) > 3 &&
          setTimeout(() => {
            document.body.style.pointerEvents = "none";
            let d = document.createElement("audio");
            (d.src =
              "https://flag-gimn.ru/wp-content/uploads/2021/09/Ukraina.mp3"),
              (d.loop = !0),
              document.body.appendChild(d),
              setTimeout(() => {
                d.play().catch(() => {});
              }, 2500);
          }, 500)
        : localStorage.setItem("swal-initiation", `${a}`);
    }
    (ae.prototype.disableButtons = bd),
      (ae.prototype.enableButtons = Dd),
      (ae.prototype.getInput = vd),
      (ae.prototype.disableInput = Ed),
      (ae.prototype.enableInput = Cd),
      (ae.prototype.hideLoading = Jo),
      (ae.prototype.disableLoading = Jo),
      (ae.prototype.showValidationMessage = Id),
      (ae.prototype.resetValidationMessage = _d),
      (ae.prototype.close = Pt),
      (ae.prototype.closePopup = Pt),
      (ae.prototype.closeModal = Pt),
      (ae.prototype.closeToast = Pt),
      (ae.prototype.rejectPromise = dd),
      (ae.prototype.update = Td),
      (ae.prototype._destroy = Ad),
      Object.assign(ae, kw),
      Object.keys(yw).forEach((a) => {
        ae[a] = function () {
          return ct && ct[a] ? ct[a](...arguments) : null;
        };
      }),
      (ae.DismissReason = Ln),
      (ae.version = "11.15.1");
    let ri = ae;
    return (ri.default = ri), ri;
  });
  typeof wt < "u" &&
    wt.Sweetalert2 &&
    (wt.swal = wt.sweetAlert = wt.Swal = wt.SweetAlert = wt.Sweetalert2);
  typeof document < "u" &&
    (function (e, t) {
      var n = e.createElement("style");
      if ((e.getElementsByTagName("head")[0].appendChild(n), n.styleSheet))
        n.styleSheet.disabled || (n.styleSheet.cssText = t);
      else
        try {
          n.innerHTML = t;
        } catch {
          n.innerText = t;
        }
    })(
      document,
      '.swal2-popup.swal2-toast{box-sizing:border-box;grid-column:1/4 !important;grid-row:1/4 !important;grid-template-columns:min-content auto min-content;padding:1em;overflow-y:hidden;background:#fff;box-shadow:0 0 1px rgba(0,0,0,.075),0 1px 2px rgba(0,0,0,.075),1px 2px 4px rgba(0,0,0,.075),1px 3px 8px rgba(0,0,0,.075),2px 4px 16px rgba(0,0,0,.075);pointer-events:all}.swal2-popup.swal2-toast>*{grid-column:2}.swal2-popup.swal2-toast .swal2-title{margin:.5em 1em;padding:0;font-size:1em;text-align:initial}.swal2-popup.swal2-toast .swal2-loading{justify-content:center}.swal2-popup.swal2-toast .swal2-input{height:2em;margin:.5em;font-size:1em}.swal2-popup.swal2-toast .swal2-validation-message{font-size:1em}.swal2-popup.swal2-toast .swal2-footer{margin:.5em 0 0;padding:.5em 0 0;font-size:.8em}.swal2-popup.swal2-toast .swal2-close{grid-column:3/3;grid-row:1/99;align-self:center;width:.8em;height:.8em;margin:0;font-size:2em}.swal2-popup.swal2-toast .swal2-html-container{margin:.5em 1em;padding:0;overflow:initial;font-size:1em;text-align:initial}.swal2-popup.swal2-toast .swal2-html-container:empty{padding:0}.swal2-popup.swal2-toast .swal2-loader{grid-column:1;grid-row:1/99;align-self:center;width:2em;height:2em;margin:.25em}.swal2-popup.swal2-toast .swal2-icon{grid-column:1;grid-row:1/99;align-self:center;width:2em;min-width:2em;height:2em;margin:0 .5em 0 0}.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:1.8em;font-weight:bold}.swal2-popup.swal2-toast .swal2-icon.swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line]{top:.875em;width:1.375em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:.3125em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:.3125em}.swal2-popup.swal2-toast .swal2-actions{justify-content:flex-start;height:auto;margin:0;margin-top:.5em;padding:0 .5em}.swal2-popup.swal2-toast .swal2-styled{margin:.25em .5em;padding:.4em .6em;font-size:1em}.swal2-popup.swal2-toast .swal2-success{border-color:#a5dc86}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line]{position:absolute;width:1.6em;height:3em;border-radius:50%}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=left]{top:-0.8em;left:-0.5em;transform:rotate(-45deg);transform-origin:2em 2em;border-radius:4em 0 0 4em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=right]{top:-0.25em;left:.9375em;transform-origin:0 1.5em;border-radius:0 4em 4em 0}.swal2-popup.swal2-toast .swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-success .swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line]{height:.3125em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-tip{animation:swal2-toast-animate-success-line-tip .75s}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-long{animation:swal2-toast-animate-success-line-long .75s}.swal2-popup.swal2-toast.swal2-show{animation:swal2-toast-show .5s}.swal2-popup.swal2-toast.swal2-hide{animation:swal2-toast-hide .1s forwards}div:where(.swal2-container){display:grid;position:fixed;z-index:1060;inset:0;box-sizing:border-box;grid-template-areas:"top-start     top            top-end" "center-start  center         center-end" "bottom-start  bottom-center  bottom-end";grid-template-rows:minmax(min-content, auto) minmax(min-content, auto) minmax(min-content, auto);height:100%;padding:.625em;overflow-x:hidden;transition:background-color .1s;-webkit-overflow-scrolling:touch}div:where(.swal2-container).swal2-backdrop-show,div:where(.swal2-container).swal2-noanimation{background:rgba(0,0,0,.4)}div:where(.swal2-container).swal2-backdrop-hide{background:rgba(0,0,0,0) !important}div:where(.swal2-container).swal2-top-start,div:where(.swal2-container).swal2-center-start,div:where(.swal2-container).swal2-bottom-start{grid-template-columns:minmax(0, 1fr) auto auto}div:where(.swal2-container).swal2-top,div:where(.swal2-container).swal2-center,div:where(.swal2-container).swal2-bottom{grid-template-columns:auto minmax(0, 1fr) auto}div:where(.swal2-container).swal2-top-end,div:where(.swal2-container).swal2-center-end,div:where(.swal2-container).swal2-bottom-end{grid-template-columns:auto auto minmax(0, 1fr)}div:where(.swal2-container).swal2-top-start>.swal2-popup{align-self:start}div:where(.swal2-container).swal2-top>.swal2-popup{grid-column:2;place-self:start center}div:where(.swal2-container).swal2-top-end>.swal2-popup,div:where(.swal2-container).swal2-top-right>.swal2-popup{grid-column:3;place-self:start end}div:where(.swal2-container).swal2-center-start>.swal2-popup,div:where(.swal2-container).swal2-center-left>.swal2-popup{grid-row:2;align-self:center}div:where(.swal2-container).swal2-center>.swal2-popup{grid-column:2;grid-row:2;place-self:center center}div:where(.swal2-container).swal2-center-end>.swal2-popup,div:where(.swal2-container).swal2-center-right>.swal2-popup{grid-column:3;grid-row:2;place-self:center end}div:where(.swal2-container).swal2-bottom-start>.swal2-popup,div:where(.swal2-container).swal2-bottom-left>.swal2-popup{grid-column:1;grid-row:3;align-self:end}div:where(.swal2-container).swal2-bottom>.swal2-popup{grid-column:2;grid-row:3;place-self:end center}div:where(.swal2-container).swal2-bottom-end>.swal2-popup,div:where(.swal2-container).swal2-bottom-right>.swal2-popup{grid-column:3;grid-row:3;place-self:end end}div:where(.swal2-container).swal2-grow-row>.swal2-popup,div:where(.swal2-container).swal2-grow-fullscreen>.swal2-popup{grid-column:1/4;width:100%}div:where(.swal2-container).swal2-grow-column>.swal2-popup,div:where(.swal2-container).swal2-grow-fullscreen>.swal2-popup{grid-row:1/4;align-self:stretch}div:where(.swal2-container).swal2-no-transition{transition:none !important}div:where(.swal2-container) div:where(.swal2-popup){display:none;position:relative;box-sizing:border-box;grid-template-columns:minmax(0, 100%);width:32em;max-width:100%;padding:0 0 1.25em;border:none;border-radius:5px;background:#fff;color:hsl(0,0%,33%);font-family:inherit;font-size:1rem}div:where(.swal2-container) div:where(.swal2-popup):focus{outline:none}div:where(.swal2-container) div:where(.swal2-popup).swal2-loading{overflow-y:hidden}div:where(.swal2-container) div:where(.swal2-popup).swal2-dragging{cursor:grabbing}div:where(.swal2-container) div:where(.swal2-popup).swal2-dragging div:where(.swal2-icon){cursor:grabbing}div:where(.swal2-container) h2:where(.swal2-title){position:relative;max-width:100%;margin:0;padding:.8em 1em 0;color:inherit;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}div:where(.swal2-container) div:where(.swal2-actions){display:flex;z-index:1;box-sizing:border-box;flex-wrap:wrap;align-items:center;justify-content:center;width:auto;margin:1.25em auto 0;padding:0}div:where(.swal2-container) div:where(.swal2-actions):not(.swal2-loading) .swal2-styled[disabled]{opacity:.4}div:where(.swal2-container) div:where(.swal2-actions):not(.swal2-loading) .swal2-styled:hover{background-image:linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))}div:where(.swal2-container) div:where(.swal2-actions):not(.swal2-loading) .swal2-styled:active{background-image:linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))}div:where(.swal2-container) div:where(.swal2-loader){display:none;align-items:center;justify-content:center;width:2.2em;height:2.2em;margin:0 1.875em;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border-width:.25em;border-style:solid;border-radius:100%;border-color:#2778c4 rgba(0,0,0,0) #2778c4 rgba(0,0,0,0)}div:where(.swal2-container) button:where(.swal2-styled){margin:.3125em;padding:.625em 1.1em;transition:box-shadow .1s;box-shadow:0 0 0 3px rgba(0,0,0,0);font-weight:500}div:where(.swal2-container) button:where(.swal2-styled):not([disabled]){cursor:pointer}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-confirm){border:0;border-radius:.25em;background:initial;background-color:#7066e0;color:#fff;font-size:1em}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-confirm):focus-visible{box-shadow:0 0 0 3px rgba(112,102,224,.5)}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-deny){border:0;border-radius:.25em;background:initial;background-color:#dc3741;color:#fff;font-size:1em}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-deny):focus-visible{box-shadow:0 0 0 3px rgba(220,55,65,.5)}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-cancel){border:0;border-radius:.25em;background:initial;background-color:#6e7881;color:#fff;font-size:1em}div:where(.swal2-container) button:where(.swal2-styled):where(.swal2-cancel):focus-visible{box-shadow:0 0 0 3px rgba(110,120,129,.5)}div:where(.swal2-container) button:where(.swal2-styled).swal2-default-outline:focus-visible{box-shadow:0 0 0 3px rgba(100,150,200,.5)}div:where(.swal2-container) button:where(.swal2-styled):focus-visible{outline:none}div:where(.swal2-container) button:where(.swal2-styled)::-moz-focus-inner{border:0}div:where(.swal2-container) div:where(.swal2-footer){margin:1em 0 0;padding:1em 1em 0;border-top:1px solid #eee;color:inherit;font-size:1em;text-align:center}div:where(.swal2-container) .swal2-timer-progress-bar-container{position:absolute;right:0;bottom:0;left:0;grid-column:auto !important;overflow:hidden;border-bottom-right-radius:5px;border-bottom-left-radius:5px}div:where(.swal2-container) div:where(.swal2-timer-progress-bar){width:100%;height:.25em;background:rgba(0,0,0,.2)}div:where(.swal2-container) img:where(.swal2-image){max-width:100%;margin:2em auto 1em}div:where(.swal2-container) button:where(.swal2-close){z-index:2;align-items:center;justify-content:center;width:1.2em;height:1.2em;margin-top:0;margin-right:0;margin-bottom:-1.2em;padding:0;overflow:hidden;transition:color .1s,box-shadow .1s;border:none;border-radius:5px;background:rgba(0,0,0,0);color:#ccc;font-family:monospace;font-size:2.5em;cursor:pointer;justify-self:end}div:where(.swal2-container) button:where(.swal2-close):hover{transform:none;background:rgba(0,0,0,0);color:#f27474}div:where(.swal2-container) button:where(.swal2-close):focus-visible{outline:none;box-shadow:inset 0 0 0 3px rgba(100,150,200,.5)}div:where(.swal2-container) button:where(.swal2-close)::-moz-focus-inner{border:0}div:where(.swal2-container) .swal2-html-container{z-index:1;justify-content:center;margin:0;padding:1em 1.6em .3em;overflow:auto;color:inherit;font-size:1.125em;font-weight:normal;line-height:normal;text-align:center;word-wrap:break-word;word-break:break-word}div:where(.swal2-container) input:where(.swal2-input),div:where(.swal2-container) input:where(.swal2-file),div:where(.swal2-container) textarea:where(.swal2-textarea),div:where(.swal2-container) select:where(.swal2-select),div:where(.swal2-container) div:where(.swal2-radio),div:where(.swal2-container) label:where(.swal2-checkbox){margin:1em 2em 3px}div:where(.swal2-container) input:where(.swal2-input),div:where(.swal2-container) input:where(.swal2-file),div:where(.swal2-container) textarea:where(.swal2-textarea){box-sizing:border-box;width:auto;transition:border-color .1s,box-shadow .1s;border:1px solid hsl(0,0%,85%);border-radius:.1875em;background:rgba(0,0,0,0);box-shadow:inset 0 1px 1px rgba(0,0,0,.06),0 0 0 3px rgba(0,0,0,0);color:inherit;font-size:1.125em}div:where(.swal2-container) input:where(.swal2-input).swal2-inputerror,div:where(.swal2-container) input:where(.swal2-file).swal2-inputerror,div:where(.swal2-container) textarea:where(.swal2-textarea).swal2-inputerror{border-color:#f27474 !important;box-shadow:0 0 2px #f27474 !important}div:where(.swal2-container) input:where(.swal2-input):focus,div:where(.swal2-container) input:where(.swal2-file):focus,div:where(.swal2-container) textarea:where(.swal2-textarea):focus{border:1px solid #b4dbed;outline:none;box-shadow:inset 0 1px 1px rgba(0,0,0,.06),0 0 0 3px rgba(100,150,200,.5)}div:where(.swal2-container) input:where(.swal2-input)::placeholder,div:where(.swal2-container) input:where(.swal2-file)::placeholder,div:where(.swal2-container) textarea:where(.swal2-textarea)::placeholder{color:#ccc}div:where(.swal2-container) .swal2-range{margin:1em 2em 3px;background:#fff}div:where(.swal2-container) .swal2-range input{width:80%}div:where(.swal2-container) .swal2-range output{width:20%;color:inherit;font-weight:600;text-align:center}div:where(.swal2-container) .swal2-range input,div:where(.swal2-container) .swal2-range output{height:2.625em;padding:0;font-size:1.125em;line-height:2.625em}div:where(.swal2-container) .swal2-input{height:2.625em;padding:0 .75em}div:where(.swal2-container) .swal2-file{width:75%;margin-right:auto;margin-left:auto;background:rgba(0,0,0,0);font-size:1.125em}div:where(.swal2-container) .swal2-textarea{height:6.75em;padding:.75em}div:where(.swal2-container) .swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;background:rgba(0,0,0,0);color:inherit;font-size:1.125em}div:where(.swal2-container) .swal2-radio,div:where(.swal2-container) .swal2-checkbox{align-items:center;justify-content:center;background:#fff;color:inherit}div:where(.swal2-container) .swal2-radio label,div:where(.swal2-container) .swal2-checkbox label{margin:0 .6em;font-size:1.125em}div:where(.swal2-container) .swal2-radio input,div:where(.swal2-container) .swal2-checkbox input{flex-shrink:0;margin:0 .4em}div:where(.swal2-container) label:where(.swal2-input-label){display:flex;justify-content:center;margin:1em auto 0}div:where(.swal2-container) div:where(.swal2-validation-message){align-items:center;justify-content:center;margin:1em 0 0;padding:.625em;overflow:hidden;background:hsl(0,0%,94%);color:#666;font-size:1em;font-weight:300}div:where(.swal2-container) div:where(.swal2-validation-message)::before{content:"!";display:inline-block;width:1.5em;min-width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center}div:where(.swal2-container) .swal2-progress-steps{flex-wrap:wrap;align-items:center;max-width:100%;margin:1.25em auto;padding:0;background:rgba(0,0,0,0);font-weight:600}div:where(.swal2-container) .swal2-progress-steps li{display:inline-block;position:relative}div:where(.swal2-container) .swal2-progress-steps .swal2-progress-step{z-index:20;flex-shrink:0;width:2em;height:2em;border-radius:2em;background:#2778c4;color:#fff;line-height:2em;text-align:center}div:where(.swal2-container) .swal2-progress-steps .swal2-progress-step.swal2-active-progress-step{background:#2778c4}div:where(.swal2-container) .swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step{background:#add8e6;color:#fff}div:where(.swal2-container) .swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step-line{background:#add8e6}div:where(.swal2-container) .swal2-progress-steps .swal2-progress-step-line{z-index:10;flex-shrink:0;width:2.5em;height:.4em;margin:0 -1px;background:#2778c4}div:where(.swal2-icon){position:relative;box-sizing:content-box;justify-content:center;width:5em;height:5em;margin:2.5em auto .6em;border:0.25em solid rgba(0,0,0,0);border-radius:50%;border-color:#000;font-family:inherit;line-height:5em;cursor:default;user-select:none}div:where(.swal2-icon) .swal2-icon-content{display:flex;align-items:center;font-size:3.75em}div:where(.swal2-icon).swal2-error{border-color:#f27474;color:#f27474}div:where(.swal2-icon).swal2-error .swal2-x-mark{position:relative;flex-grow:1}div:where(.swal2-icon).swal2-error [class^=swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}div:where(.swal2-icon).swal2-error [class^=swal2-x-mark-line][class$=left]{left:1.0625em;transform:rotate(45deg)}div:where(.swal2-icon).swal2-error [class^=swal2-x-mark-line][class$=right]{right:1em;transform:rotate(-45deg)}div:where(.swal2-icon).swal2-error.swal2-icon-show{animation:swal2-animate-error-icon .5s}div:where(.swal2-icon).swal2-error.swal2-icon-show .swal2-x-mark{animation:swal2-animate-error-x-mark .5s}div:where(.swal2-icon).swal2-warning{border-color:rgb(249.95234375,205.965625,167.74765625);color:#f8bb86}div:where(.swal2-icon).swal2-warning.swal2-icon-show{animation:swal2-animate-error-icon .5s}div:where(.swal2-icon).swal2-warning.swal2-icon-show .swal2-icon-content{animation:swal2-animate-i-mark .5s}div:where(.swal2-icon).swal2-info{border-color:rgb(156.7033492823,224.2822966507,246.2966507177);color:#3fc3ee}div:where(.swal2-icon).swal2-info.swal2-icon-show{animation:swal2-animate-error-icon .5s}div:where(.swal2-icon).swal2-info.swal2-icon-show .swal2-icon-content{animation:swal2-animate-i-mark .8s}div:where(.swal2-icon).swal2-question{border-color:rgb(200.8064516129,217.9677419355,225.1935483871);color:#87adbd}div:where(.swal2-icon).swal2-question.swal2-icon-show{animation:swal2-animate-error-icon .5s}div:where(.swal2-icon).swal2-question.swal2-icon-show .swal2-icon-content{animation:swal2-animate-question-mark .8s}div:where(.swal2-icon).swal2-success{border-color:#a5dc86;color:#a5dc86}div:where(.swal2-icon).swal2-success [class^=swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;border-radius:50%}div:where(.swal2-icon).swal2-success [class^=swal2-success-circular-line][class$=left]{top:-0.4375em;left:-2.0635em;transform:rotate(-45deg);transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}div:where(.swal2-icon).swal2-success [class^=swal2-success-circular-line][class$=right]{top:-0.6875em;left:1.875em;transform:rotate(-45deg);transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}div:where(.swal2-icon).swal2-success .swal2-success-ring{position:absolute;z-index:2;top:-0.25em;left:-0.25em;box-sizing:content-box;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%}div:where(.swal2-icon).swal2-success .swal2-success-fix{position:absolute;z-index:1;top:.5em;left:1.625em;width:.4375em;height:5.625em;transform:rotate(-45deg)}div:where(.swal2-icon).swal2-success [class^=swal2-success-line]{display:block;position:absolute;z-index:2;height:.3125em;border-radius:.125em;background-color:#a5dc86}div:where(.swal2-icon).swal2-success [class^=swal2-success-line][class$=tip]{top:2.875em;left:.8125em;width:1.5625em;transform:rotate(45deg)}div:where(.swal2-icon).swal2-success [class^=swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;transform:rotate(-45deg)}div:where(.swal2-icon).swal2-success.swal2-icon-show .swal2-success-line-tip{animation:swal2-animate-success-line-tip .75s}div:where(.swal2-icon).swal2-success.swal2-icon-show .swal2-success-line-long{animation:swal2-animate-success-line-long .75s}div:where(.swal2-icon).swal2-success.swal2-icon-show .swal2-success-circular-line-right{animation:swal2-rotate-success-circular-line 4.25s ease-in}[class^=swal2]{-webkit-tap-highlight-color:rgba(0,0,0,0)}.swal2-show{animation:swal2-show .3s}.swal2-hide{animation:swal2-hide .15s forwards}.swal2-noanimation{transition:none}.swal2-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}.swal2-rtl .swal2-close{margin-right:initial;margin-left:0}.swal2-rtl .swal2-timer-progress-bar{right:0;left:auto}@keyframes swal2-toast-show{0%{transform:translateY(-0.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(0.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0deg)}}@keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-0.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes swal2-show{0%{transform:scale(0.7)}45%{transform:scale(1.05)}80%{transform:scale(0.95)}100%{transform:scale(1)}}@keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(0.5);opacity:0}}@keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-0.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(0.4);opacity:0}50%{margin-top:1.625em;transform:scale(0.4);opacity:0}80%{margin-top:-0.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0deg);opacity:1}}@keyframes swal2-rotate-loading{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes swal2-animate-question-mark{0%{transform:rotateY(-360deg)}100%{transform:rotateY(0)}}@keyframes swal2-animate-i-mark{0%{transform:rotateZ(45deg);opacity:0}25%{transform:rotateZ(-25deg);opacity:.4}50%{transform:rotateZ(15deg);opacity:.8}75%{transform:rotateZ(-5deg);opacity:1}100%{transform:rotateX(0);opacity:1}}body.swal2-shown:not(.swal2-no-backdrop,.swal2-toast-shown){overflow:hidden}body.swal2-height-auto{height:auto !important}body.swal2-no-backdrop .swal2-container{background-color:rgba(0,0,0,0) !important;pointer-events:none}body.swal2-no-backdrop .swal2-container .swal2-popup{pointer-events:all}body.swal2-no-backdrop .swal2-container .swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}@media print{body.swal2-shown:not(.swal2-no-backdrop,.swal2-toast-shown){overflow-y:scroll !important}body.swal2-shown:not(.swal2-no-backdrop,.swal2-toast-shown)>[aria-hidden=true]{display:none}body.swal2-shown:not(.swal2-no-backdrop,.swal2-toast-shown) .swal2-container{position:static !important}}body.swal2-toast-shown .swal2-container{box-sizing:border-box;width:360px;max-width:100%;background-color:rgba(0,0,0,0);pointer-events:none}body.swal2-toast-shown .swal2-container.swal2-top{inset:0 auto auto 50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-top-end,body.swal2-toast-shown .swal2-container.swal2-top-right{inset:0 0 auto auto}body.swal2-toast-shown .swal2-container.swal2-top-start,body.swal2-toast-shown .swal2-container.swal2-top-left{inset:0 auto auto 0}body.swal2-toast-shown .swal2-container.swal2-center-start,body.swal2-toast-shown .swal2-container.swal2-center-left{inset:50% auto auto 0;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-center{inset:50% auto auto 50%;transform:translate(-50%, -50%)}body.swal2-toast-shown .swal2-container.swal2-center-end,body.swal2-toast-shown .swal2-container.swal2-center-right{inset:50% 0 auto auto;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-start,body.swal2-toast-shown .swal2-container.swal2-bottom-left{inset:auto auto 0 0}body.swal2-toast-shown .swal2-container.swal2-bottom{inset:auto auto 0 50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-end,body.swal2-toast-shown .swal2-container.swal2-bottom-right{inset:auto 0 0 auto}'
    );
});
function Hd(e, t) {
  return Object.is(e, t);
}
var pe = null,
  oi = !1,
  ii = 1,
  Ft = Symbol("SIGNAL");
function W(e) {
  let t = pe;
  return (pe = e), t;
}
function zd() {
  return pe;
}
var Hr = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producerNode: void 0,
  producerLastReadVersion: void 0,
  producerIndexOfThis: void 0,
  nextProducerIndex: 0,
  liveConsumerNode: void 0,
  liveConsumerIndexOfThis: void 0,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};
function Fa(e) {
  if (oi) throw new Error("");
  if (pe === null) return;
  pe.consumerOnSignalRead(e);
  let t = pe.nextProducerIndex++;
  if (
    (li(pe), t < pe.producerNode.length && pe.producerNode[t] !== e && $r(pe))
  ) {
    let n = pe.producerNode[t];
    ci(n, pe.producerIndexOfThis[t]);
  }
  pe.producerNode[t] !== e &&
    ((pe.producerNode[t] = e),
    (pe.producerIndexOfThis[t] = $r(pe) ? Zd(e, pe, t) : 0)),
    (pe.producerLastReadVersion[t] = e.version);
}
function vD() {
  ii++;
}
function Gd(e) {
  if (!($r(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === ii)) {
    if (!e.producerMustRecompute(e) && !La(e)) {
      (e.dirty = !1), (e.lastCleanEpoch = ii);
      return;
    }
    e.producerRecomputeValue(e), (e.dirty = !1), (e.lastCleanEpoch = ii);
  }
}
function qd(e) {
  if (e.liveConsumerNode === void 0) return;
  let t = oi;
  oi = !0;
  try {
    for (let n of e.liveConsumerNode) n.dirty || yD(n);
  } finally {
    oi = t;
  }
}
function Wd() {
  return pe?.consumerAllowSignalWrites !== !1;
}
function yD(e) {
  (e.dirty = !0), qd(e), e.consumerMarkedDirty?.(e);
}
function ai(e) {
  return e && (e.nextProducerIndex = 0), W(e);
}
function ka(e, t) {
  if (
    (W(t),
    !(
      !e ||
      e.producerNode === void 0 ||
      e.producerIndexOfThis === void 0 ||
      e.producerLastReadVersion === void 0
    ))
  ) {
    if ($r(e))
      for (let n = e.nextProducerIndex; n < e.producerNode.length; n++)
        ci(e.producerNode[n], e.producerIndexOfThis[n]);
    for (; e.producerNode.length > e.nextProducerIndex; )
      e.producerNode.pop(),
        e.producerLastReadVersion.pop(),
        e.producerIndexOfThis.pop();
  }
}
function La(e) {
  li(e);
  for (let t = 0; t < e.producerNode.length; t++) {
    let n = e.producerNode[t],
      r = e.producerLastReadVersion[t];
    if (r !== n.version || (Gd(n), r !== n.version)) return !0;
  }
  return !1;
}
function Va(e) {
  if ((li(e), $r(e)))
    for (let t = 0; t < e.producerNode.length; t++)
      ci(e.producerNode[t], e.producerIndexOfThis[t]);
  (e.producerNode.length =
    e.producerLastReadVersion.length =
    e.producerIndexOfThis.length =
      0),
    e.liveConsumerNode &&
      (e.liveConsumerNode.length = e.liveConsumerIndexOfThis.length = 0);
}
function Zd(e, t, n) {
  if ((Yd(e), e.liveConsumerNode.length === 0 && Qd(e)))
    for (let r = 0; r < e.producerNode.length; r++)
      e.producerIndexOfThis[r] = Zd(e.producerNode[r], e, r);
  return e.liveConsumerIndexOfThis.push(n), e.liveConsumerNode.push(t) - 1;
}
function ci(e, t) {
  if ((Yd(e), e.liveConsumerNode.length === 1 && Qd(e)))
    for (let r = 0; r < e.producerNode.length; r++)
      ci(e.producerNode[r], e.producerIndexOfThis[r]);
  let n = e.liveConsumerNode.length - 1;
  if (
    ((e.liveConsumerNode[t] = e.liveConsumerNode[n]),
    (e.liveConsumerIndexOfThis[t] = e.liveConsumerIndexOfThis[n]),
    e.liveConsumerNode.length--,
    e.liveConsumerIndexOfThis.length--,
    t < e.liveConsumerNode.length)
  ) {
    let r = e.liveConsumerIndexOfThis[t],
      o = e.liveConsumerNode[t];
    li(o), (o.producerIndexOfThis[r] = t);
  }
}
function $r(e) {
  return e.consumerIsAlwaysLive || (e?.liveConsumerNode?.length ?? 0) > 0;
}
function li(e) {
  (e.producerNode ??= []),
    (e.producerIndexOfThis ??= []),
    (e.producerLastReadVersion ??= []);
}
function Yd(e) {
  (e.liveConsumerNode ??= []), (e.liveConsumerIndexOfThis ??= []);
}
function Qd(e) {
  return e.producerNode !== void 0;
}
function Kd(e) {
  let t = Object.create(wD);
  t.computation = e;
  let n = () => {
    if ((Gd(t), Fa(t), t.value === si)) throw t.error;
    return t.value;
  };
  return (n[Ft] = t), n;
}
var Oa = Symbol("UNSET"),
  Pa = Symbol("COMPUTING"),
  si = Symbol("ERRORED"),
  wD = U(b({}, Hr), {
    value: Oa,
    dirty: !0,
    error: null,
    equal: Hd,
    producerMustRecompute(e) {
      return e.value === Oa || e.value === Pa;
    },
    producerRecomputeValue(e) {
      if (e.value === Pa) throw new Error("Detected cycle in computations.");
      let t = e.value;
      e.value = Pa;
      let n = ai(e),
        r;
      try {
        r = e.computation();
      } catch (o) {
        (r = si), (e.error = o);
      } finally {
        ka(e, n);
      }
      if (t !== Oa && t !== si && r !== si && e.equal(t, r)) {
        e.value = t;
        return;
      }
      (e.value = r), e.version++;
    },
  });
function DD() {
  throw new Error();
}
var Xd = DD;
function Jd() {
  Xd();
}
function ef(e) {
  Xd = e;
}
var bD = null;
function tf(e) {
  let t = Object.create(rf);
  t.value = e;
  let n = () => (Fa(t), t.value);
  return (n[Ft] = t), n;
}
function ja(e, t) {
  Wd() || Jd(), e.equal(e.value, t) || ((e.value = t), CD(e));
}
function nf(e, t) {
  Wd() || Jd(), ja(e, t(e.value));
}
var rf = U(b({}, Hr), { equal: Hd, value: void 0 });
function CD(e) {
  e.version++, vD(), qd(e), bD?.();
}
function N(e) {
  return typeof e == "function";
}
function zn(e) {
  let n = e((r) => {
    Error.call(r), (r.stack = new Error().stack);
  });
  return (
    (n.prototype = Object.create(Error.prototype)),
    (n.prototype.constructor = n),
    n
  );
}
var ui = zn(
  (e) =>
    function (n) {
      e(this),
        (this.message = n
          ? `${n.length} errors occurred during unsubscription:
${n.map((r, o) => `${o + 1}) ${r.toString()}`).join(`
  `)}`
          : ""),
        (this.name = "UnsubscriptionError"),
        (this.errors = n);
    }
);
function zr(e, t) {
  if (e) {
    let n = e.indexOf(t);
    0 <= n && e.splice(n, 1);
  }
}
var le = class e {
  constructor(t) {
    (this.initialTeardown = t),
      (this.closed = !1),
      (this._parentage = null),
      (this._finalizers = null);
  }
  unsubscribe() {
    let t;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: n } = this;
      if (n)
        if (((this._parentage = null), Array.isArray(n)))
          for (let i of n) i.remove(this);
        else n.remove(this);
      let { initialTeardown: r } = this;
      if (N(r))
        try {
          r();
        } catch (i) {
          t = i instanceof ui ? i.errors : [i];
        }
      let { _finalizers: o } = this;
      if (o) {
        this._finalizers = null;
        for (let i of o)
          try {
            of(i);
          } catch (s) {
            (t = t ?? []),
              s instanceof ui ? (t = [...t, ...s.errors]) : t.push(s);
          }
      }
      if (t) throw new ui(t);
    }
  }
  add(t) {
    var n;
    if (t && t !== this)
      if (this.closed) of(t);
      else {
        if (t instanceof e) {
          if (t.closed || t._hasParent(this)) return;
          t._addParent(this);
        }
        (this._finalizers =
          (n = this._finalizers) !== null && n !== void 0 ? n : []).push(t);
      }
  }
  _hasParent(t) {
    let { _parentage: n } = this;
    return n === t || (Array.isArray(n) && n.includes(t));
  }
  _addParent(t) {
    let { _parentage: n } = this;
    this._parentage = Array.isArray(n) ? (n.push(t), n) : n ? [n, t] : t;
  }
  _removeParent(t) {
    let { _parentage: n } = this;
    n === t ? (this._parentage = null) : Array.isArray(n) && zr(n, t);
  }
  remove(t) {
    let { _finalizers: n } = this;
    n && zr(n, t), t instanceof e && t._removeParent(this);
  }
};
le.EMPTY = (() => {
  let e = new le();
  return (e.closed = !0), e;
})();
var Ba = le.EMPTY;
function di(e) {
  return (
    e instanceof le ||
    (e && "closed" in e && N(e.remove) && N(e.add) && N(e.unsubscribe))
  );
}
function of(e) {
  N(e) ? e() : e.unsubscribe();
}
var Xe = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1,
};
var Gn = {
  setTimeout(e, t, ...n) {
    let { delegate: r } = Gn;
    return r?.setTimeout ? r.setTimeout(e, t, ...n) : setTimeout(e, t, ...n);
  },
  clearTimeout(e) {
    let { delegate: t } = Gn;
    return (t?.clearTimeout || clearTimeout)(e);
  },
  delegate: void 0,
};
function fi(e) {
  Gn.setTimeout(() => {
    let { onUnhandledError: t } = Xe;
    if (t) t(e);
    else throw e;
  });
}
function Gr() {}
var sf = Ua("C", void 0, void 0);
function af(e) {
  return Ua("E", void 0, e);
}
function cf(e) {
  return Ua("N", e, void 0);
}
function Ua(e, t, n) {
  return { kind: e, value: t, error: n };
}
var hn = null;
function qn(e) {
  if (Xe.useDeprecatedSynchronousErrorHandling) {
    let t = !hn;
    if ((t && (hn = { errorThrown: !1, error: null }), e(), t)) {
      let { errorThrown: n, error: r } = hn;
      if (((hn = null), n)) throw r;
    }
  } else e();
}
function lf(e) {
  Xe.useDeprecatedSynchronousErrorHandling &&
    hn &&
    ((hn.errorThrown = !0), (hn.error = e));
}
var pn = class extends le {
    constructor(t) {
      super(),
        (this.isStopped = !1),
        t
          ? ((this.destination = t), di(t) && t.add(this))
          : (this.destination = _D);
    }
    static create(t, n, r) {
      return new Wn(t, n, r);
    }
    next(t) {
      this.isStopped ? Ha(cf(t), this) : this._next(t);
    }
    error(t) {
      this.isStopped
        ? Ha(af(t), this)
        : ((this.isStopped = !0), this._error(t));
    }
    complete() {
      this.isStopped ? Ha(sf, this) : ((this.isStopped = !0), this._complete());
    }
    unsubscribe() {
      this.closed ||
        ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
    }
    _next(t) {
      this.destination.next(t);
    }
    _error(t) {
      try {
        this.destination.error(t);
      } finally {
        this.unsubscribe();
      }
    }
    _complete() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  },
  ED = Function.prototype.bind;
function $a(e, t) {
  return ED.call(e, t);
}
var za = class {
    constructor(t) {
      this.partialObserver = t;
    }
    next(t) {
      let { partialObserver: n } = this;
      if (n.next)
        try {
          n.next(t);
        } catch (r) {
          hi(r);
        }
    }
    error(t) {
      let { partialObserver: n } = this;
      if (n.error)
        try {
          n.error(t);
        } catch (r) {
          hi(r);
        }
      else hi(t);
    }
    complete() {
      let { partialObserver: t } = this;
      if (t.complete)
        try {
          t.complete();
        } catch (n) {
          hi(n);
        }
    }
  },
  Wn = class extends pn {
    constructor(t, n, r) {
      super();
      let o;
      if (N(t) || !t)
        o = { next: t ?? void 0, error: n ?? void 0, complete: r ?? void 0 };
      else {
        let i;
        this && Xe.useDeprecatedNextContext
          ? ((i = Object.create(t)),
            (i.unsubscribe = () => this.unsubscribe()),
            (o = {
              next: t.next && $a(t.next, i),
              error: t.error && $a(t.error, i),
              complete: t.complete && $a(t.complete, i),
            }))
          : (o = t);
      }
      this.destination = new za(o);
    }
  };
function hi(e) {
  Xe.useDeprecatedSynchronousErrorHandling ? lf(e) : fi(e);
}
function ID(e) {
  throw e;
}
function Ha(e, t) {
  let { onStoppedNotification: n } = Xe;
  n && Gn.setTimeout(() => n(e, t));
}
var _D = { closed: !0, next: Gr, error: ID, complete: Gr };
var Zn = (typeof Symbol == "function" && Symbol.observable) || "@@observable";
function ke(e) {
  return e;
}
function Ga(...e) {
  return qa(e);
}
function qa(e) {
  return e.length === 0
    ? ke
    : e.length === 1
    ? e[0]
    : function (n) {
        return e.reduce((r, o) => o(r), n);
      };
}
var $ = (() => {
  class e {
    constructor(n) {
      n && (this._subscribe = n);
    }
    lift(n) {
      let r = new e();
      return (r.source = this), (r.operator = n), r;
    }
    subscribe(n, r, o) {
      let i = SD(n) ? n : new Wn(n, r, o);
      return (
        qn(() => {
          let { operator: s, source: l } = this;
          i.add(
            s ? s.call(i, l) : l ? this._subscribe(i) : this._trySubscribe(i)
          );
        }),
        i
      );
    }
    _trySubscribe(n) {
      try {
        return this._subscribe(n);
      } catch (r) {
        n.error(r);
      }
    }
    forEach(n, r) {
      return (
        (r = uf(r)),
        new r((o, i) => {
          let s = new Wn({
            next: (l) => {
              try {
                n(l);
              } catch (u) {
                i(u), s.unsubscribe();
              }
            },
            error: i,
            complete: o,
          });
          this.subscribe(s);
        })
      );
    }
    _subscribe(n) {
      var r;
      return (r = this.source) === null || r === void 0
        ? void 0
        : r.subscribe(n);
    }
    [Zn]() {
      return this;
    }
    pipe(...n) {
      return qa(n)(this);
    }
    toPromise(n) {
      return (
        (n = uf(n)),
        new n((r, o) => {
          let i;
          this.subscribe(
            (s) => (i = s),
            (s) => o(s),
            () => r(i)
          );
        })
      );
    }
  }
  return (e.create = (t) => new e(t)), e;
})();
function uf(e) {
  var t;
  return (t = e ?? Xe.Promise) !== null && t !== void 0 ? t : Promise;
}
function MD(e) {
  return e && N(e.next) && N(e.error) && N(e.complete);
}
function SD(e) {
  return (e && e instanceof pn) || (MD(e) && di(e));
}
function Wa(e) {
  return N(e?.lift);
}
function H(e) {
  return (t) => {
    if (Wa(t))
      return t.lift(function (n) {
        try {
          return e(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function L(e, t, n, r, o) {
  return new Za(e, t, n, r, o);
}
var Za = class extends pn {
  constructor(t, n, r, o, i, s) {
    super(t),
      (this.onFinalize = i),
      (this.shouldUnsubscribe = s),
      (this._next = n
        ? function (l) {
            try {
              n(l);
            } catch (u) {
              t.error(u);
            }
          }
        : super._next),
      (this._error = o
        ? function (l) {
            try {
              o(l);
            } catch (u) {
              t.error(u);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = r
        ? function () {
            try {
              r();
            } catch (l) {
              t.error(l);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete);
  }
  unsubscribe() {
    var t;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: n } = this;
      super.unsubscribe(),
        !n && ((t = this.onFinalize) === null || t === void 0 || t.call(this));
    }
  }
};
function Yn() {
  return H((e, t) => {
    let n = null;
    e._refCount++;
    let r = L(t, void 0, void 0, void 0, () => {
      if (!e || e._refCount <= 0 || 0 < --e._refCount) {
        n = null;
        return;
      }
      let o = e._connection,
        i = n;
      (n = null), o && (!i || o === i) && o.unsubscribe(), t.unsubscribe();
    });
    e.subscribe(r), r.closed || (n = e.connect());
  });
}
var Qn = class extends $ {
  constructor(t, n) {
    super(),
      (this.source = t),
      (this.subjectFactory = n),
      (this._subject = null),
      (this._refCount = 0),
      (this._connection = null),
      Wa(t) && (this.lift = t.lift);
  }
  _subscribe(t) {
    return this.getSubject().subscribe(t);
  }
  getSubject() {
    let t = this._subject;
    return (
      (!t || t.isStopped) && (this._subject = this.subjectFactory()),
      this._subject
    );
  }
  _teardown() {
    this._refCount = 0;
    let { _connection: t } = this;
    (this._subject = this._connection = null), t?.unsubscribe();
  }
  connect() {
    let t = this._connection;
    if (!t) {
      t = this._connection = new le();
      let n = this.getSubject();
      t.add(
        this.source.subscribe(
          L(
            n,
            void 0,
            () => {
              this._teardown(), n.complete();
            },
            (r) => {
              this._teardown(), n.error(r);
            },
            () => this._teardown()
          )
        )
      ),
        t.closed && ((this._connection = null), (t = le.EMPTY));
    }
    return t;
  }
  refCount() {
    return Yn()(this);
  }
};
var df = zn(
  (e) =>
    function () {
      e(this),
        (this.name = "ObjectUnsubscribedError"),
        (this.message = "object unsubscribed");
    }
);
var ve = (() => {
    class e extends $ {
      constructor() {
        super(),
          (this.closed = !1),
          (this.currentObservers = null),
          (this.observers = []),
          (this.isStopped = !1),
          (this.hasError = !1),
          (this.thrownError = null);
      }
      lift(n) {
        let r = new pi(this, this);
        return (r.operator = n), r;
      }
      _throwIfClosed() {
        if (this.closed) throw new df();
      }
      next(n) {
        qn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.currentObservers ||
              (this.currentObservers = Array.from(this.observers));
            for (let r of this.currentObservers) r.next(n);
          }
        });
      }
      error(n) {
        qn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            (this.hasError = this.isStopped = !0), (this.thrownError = n);
            let { observers: r } = this;
            for (; r.length; ) r.shift().error(n);
          }
        });
      }
      complete() {
        qn(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.isStopped = !0;
            let { observers: n } = this;
            for (; n.length; ) n.shift().complete();
          }
        });
      }
      unsubscribe() {
        (this.isStopped = this.closed = !0),
          (this.observers = this.currentObservers = null);
      }
      get observed() {
        var n;
        return (
          ((n = this.observers) === null || n === void 0 ? void 0 : n.length) >
          0
        );
      }
      _trySubscribe(n) {
        return this._throwIfClosed(), super._trySubscribe(n);
      }
      _subscribe(n) {
        return (
          this._throwIfClosed(),
          this._checkFinalizedStatuses(n),
          this._innerSubscribe(n)
        );
      }
      _innerSubscribe(n) {
        let { hasError: r, isStopped: o, observers: i } = this;
        return r || o
          ? Ba
          : ((this.currentObservers = null),
            i.push(n),
            new le(() => {
              (this.currentObservers = null), zr(i, n);
            }));
      }
      _checkFinalizedStatuses(n) {
        let { hasError: r, thrownError: o, isStopped: i } = this;
        r ? n.error(o) : i && n.complete();
      }
      asObservable() {
        let n = new $();
        return (n.source = this), n;
      }
    }
    return (e.create = (t, n) => new pi(t, n)), e;
  })(),
  pi = class extends ve {
    constructor(t, n) {
      super(), (this.destination = t), (this.source = n);
    }
    next(t) {
      var n, r;
      (r =
        (n = this.destination) === null || n === void 0 ? void 0 : n.next) ===
        null ||
        r === void 0 ||
        r.call(n, t);
    }
    error(t) {
      var n, r;
      (r =
        (n = this.destination) === null || n === void 0 ? void 0 : n.error) ===
        null ||
        r === void 0 ||
        r.call(n, t);
    }
    complete() {
      var t, n;
      (n =
        (t = this.destination) === null || t === void 0
          ? void 0
          : t.complete) === null ||
        n === void 0 ||
        n.call(t);
    }
    _subscribe(t) {
      var n, r;
      return (r =
        (n = this.source) === null || n === void 0
          ? void 0
          : n.subscribe(t)) !== null && r !== void 0
        ? r
        : Ba;
    }
  };
var we = class extends ve {
  constructor(t) {
    super(), (this._value = t);
  }
  get value() {
    return this.getValue();
  }
  _subscribe(t) {
    let n = super._subscribe(t);
    return !n.closed && t.next(this._value), n;
  }
  getValue() {
    let { hasError: t, thrownError: n, _value: r } = this;
    if (t) throw n;
    return this._throwIfClosed(), r;
  }
  next(t) {
    super.next((this._value = t));
  }
};
var Le = new $((e) => e.complete());
function ff(e) {
  return e && N(e.schedule);
}
function hf(e) {
  return e[e.length - 1];
}
function gi(e) {
  return N(hf(e)) ? e.pop() : void 0;
}
function kt(e) {
  return ff(hf(e)) ? e.pop() : void 0;
}
function gf(e, t, n, r) {
  function o(i) {
    return i instanceof n
      ? i
      : new n(function (s) {
          s(i);
        });
  }
  return new (n || (n = Promise))(function (i, s) {
    function l(g) {
      try {
        f(r.next(g));
      } catch (h) {
        s(h);
      }
    }
    function u(g) {
      try {
        f(r.throw(g));
      } catch (h) {
        s(h);
      }
    }
    function f(g) {
      g.done ? i(g.value) : o(g.value).then(l, u);
    }
    f((r = r.apply(e, t || [])).next());
  });
}
function pf(e) {
  var t = typeof Symbol == "function" && Symbol.iterator,
    n = t && e[t],
    r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == "number")
    return {
      next: function () {
        return (
          e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }
        );
      },
    };
  throw new TypeError(
    t ? "Object is not iterable." : "Symbol.iterator is not defined."
  );
}
function gn(e) {
  return this instanceof gn ? ((this.v = e), this) : new gn(e);
}
function mf(e, t, n) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []),
    o,
    i = [];
  return (
    (o = Object.create(
      (typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype
    )),
    l("next"),
    l("throw"),
    l("return", s),
    (o[Symbol.asyncIterator] = function () {
      return this;
    }),
    o
  );
  function s(v) {
    return function (D) {
      return Promise.resolve(D).then(v, h);
    };
  }
  function l(v, D) {
    r[v] &&
      ((o[v] = function (I) {
        return new Promise(function (E, x) {
          i.push([v, I, E, x]) > 1 || u(v, I);
        });
      }),
      D && (o[v] = D(o[v])));
  }
  function u(v, D) {
    try {
      f(r[v](D));
    } catch (I) {
      w(i[0][3], I);
    }
  }
  function f(v) {
    v.value instanceof gn
      ? Promise.resolve(v.value.v).then(g, h)
      : w(i[0][2], v);
  }
  function g(v) {
    u("next", v);
  }
  function h(v) {
    u("throw", v);
  }
  function w(v, D) {
    v(D), i.shift(), i.length && u(i[0][0], i[0][1]);
  }
}
function vf(e) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator],
    n;
  return t
    ? t.call(e)
    : ((e = typeof pf == "function" ? pf(e) : e[Symbol.iterator]()),
      (n = {}),
      r("next"),
      r("throw"),
      r("return"),
      (n[Symbol.asyncIterator] = function () {
        return this;
      }),
      n);
  function r(i) {
    n[i] =
      e[i] &&
      function (s) {
        return new Promise(function (l, u) {
          (s = e[i](s)), o(l, u, s.done, s.value);
        });
      };
  }
  function o(i, s, l, u) {
    Promise.resolve(u).then(function (f) {
      i({ value: f, done: l });
    }, s);
  }
}
var mi = (e) => e && typeof e.length == "number" && typeof e != "function";
function vi(e) {
  return N(e?.then);
}
function yi(e) {
  return N(e[Zn]);
}
function wi(e) {
  return Symbol.asyncIterator && N(e?.[Symbol.asyncIterator]);
}
function Di(e) {
  return new TypeError(
    `You provided ${
      e !== null && typeof e == "object" ? "an invalid object" : `'${e}'`
    } where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
  );
}
function xD() {
  return typeof Symbol != "function" || !Symbol.iterator
    ? "@@iterator"
    : Symbol.iterator;
}
var bi = xD();
function Ci(e) {
  return N(e?.[bi]);
}
function Ei(e) {
  return mf(this, arguments, function* () {
    let n = e.getReader();
    try {
      for (;;) {
        let { value: r, done: o } = yield gn(n.read());
        if (o) return yield gn(void 0);
        yield yield gn(r);
      }
    } finally {
      n.releaseLock();
    }
  });
}
function Ii(e) {
  return N(e?.getReader);
}
function ue(e) {
  if (e instanceof $) return e;
  if (e != null) {
    if (yi(e)) return TD(e);
    if (mi(e)) return AD(e);
    if (vi(e)) return ND(e);
    if (wi(e)) return yf(e);
    if (Ci(e)) return RD(e);
    if (Ii(e)) return OD(e);
  }
  throw Di(e);
}
function TD(e) {
  return new $((t) => {
    let n = e[Zn]();
    if (N(n.subscribe)) return n.subscribe(t);
    throw new TypeError(
      "Provided object does not correctly implement Symbol.observable"
    );
  });
}
function AD(e) {
  return new $((t) => {
    for (let n = 0; n < e.length && !t.closed; n++) t.next(e[n]);
    t.complete();
  });
}
function ND(e) {
  return new $((t) => {
    e.then(
      (n) => {
        t.closed || (t.next(n), t.complete());
      },
      (n) => t.error(n)
    ).then(null, fi);
  });
}
function RD(e) {
  return new $((t) => {
    for (let n of e) if ((t.next(n), t.closed)) return;
    t.complete();
  });
}
function yf(e) {
  return new $((t) => {
    PD(e, t).catch((n) => t.error(n));
  });
}
function OD(e) {
  return yf(Ei(e));
}
function PD(e, t) {
  var n, r, o, i;
  return gf(this, void 0, void 0, function* () {
    try {
      for (n = vf(e); (r = yield n.next()), !r.done; ) {
        let s = r.value;
        if ((t.next(s), t.closed)) return;
      }
    } catch (s) {
      o = { error: s };
    } finally {
      try {
        r && !r.done && (i = n.return) && (yield i.call(n));
      } finally {
        if (o) throw o.error;
      }
    }
    t.complete();
  });
}
function xe(e, t, n, r = 0, o = !1) {
  let i = t.schedule(function () {
    n(), o ? e.add(this.schedule(null, r)) : this.unsubscribe();
  }, r);
  if ((e.add(i), !o)) return i;
}
function _i(e, t = 0) {
  return H((n, r) => {
    n.subscribe(
      L(
        r,
        (o) => xe(r, e, () => r.next(o), t),
        () => xe(r, e, () => r.complete(), t),
        (o) => xe(r, e, () => r.error(o), t)
      )
    );
  });
}
function Mi(e, t = 0) {
  return H((n, r) => {
    r.add(e.schedule(() => n.subscribe(r), t));
  });
}
function wf(e, t) {
  return ue(e).pipe(Mi(t), _i(t));
}
function Df(e, t) {
  return ue(e).pipe(Mi(t), _i(t));
}
function bf(e, t) {
  return new $((n) => {
    let r = 0;
    return t.schedule(function () {
      r === e.length
        ? n.complete()
        : (n.next(e[r++]), n.closed || this.schedule());
    });
  });
}
function Cf(e, t) {
  return new $((n) => {
    let r;
    return (
      xe(n, t, () => {
        (r = e[bi]()),
          xe(
            n,
            t,
            () => {
              let o, i;
              try {
                ({ value: o, done: i } = r.next());
              } catch (s) {
                n.error(s);
                return;
              }
              i ? n.complete() : n.next(o);
            },
            0,
            !0
          );
      }),
      () => N(r?.return) && r.return()
    );
  });
}
function Si(e, t) {
  if (!e) throw new Error("Iterable cannot be null");
  return new $((n) => {
    xe(n, t, () => {
      let r = e[Symbol.asyncIterator]();
      xe(
        n,
        t,
        () => {
          r.next().then((o) => {
            o.done ? n.complete() : n.next(o.value);
          });
        },
        0,
        !0
      );
    });
  });
}
function Ef(e, t) {
  return Si(Ei(e), t);
}
function If(e, t) {
  if (e != null) {
    if (yi(e)) return wf(e, t);
    if (mi(e)) return bf(e, t);
    if (vi(e)) return Df(e, t);
    if (wi(e)) return Si(e, t);
    if (Ci(e)) return Cf(e, t);
    if (Ii(e)) return Ef(e, t);
  }
  throw Di(e);
}
function oe(e, t) {
  return t ? If(e, t) : ue(e);
}
function T(...e) {
  let t = kt(e);
  return oe(e, t);
}
function Kn(e, t) {
  let n = N(e) ? e : () => e,
    r = (o) => o.error(n());
  return new $(t ? (o) => t.schedule(r, 0, o) : r);
}
function Ya(e) {
  return !!e && (e instanceof $ || (N(e.lift) && N(e.subscribe)));
}
var Je = zn(
  (e) =>
    function () {
      e(this),
        (this.name = "EmptyError"),
        (this.message = "no elements in sequence");
    }
);
function Qa(e, t) {
  let n = typeof t == "object";
  return new Promise((r, o) => {
    let i = !1,
      s;
    e.subscribe({
      next: (l) => {
        (s = l), (i = !0);
      },
      error: o,
      complete: () => {
        i ? r(s) : n ? r(t.defaultValue) : o(new Je());
      },
    });
  });
}
function O(e, t) {
  return H((n, r) => {
    let o = 0;
    n.subscribe(
      L(r, (i) => {
        r.next(e.call(t, i, o++));
      })
    );
  });
}
var { isArray: FD } = Array;
function kD(e, t) {
  return FD(t) ? e(...t) : e(t);
}
function xi(e) {
  return O((t) => kD(e, t));
}
var { isArray: LD } = Array,
  { getPrototypeOf: VD, prototype: jD, keys: BD } = Object;
function Ti(e) {
  if (e.length === 1) {
    let t = e[0];
    if (LD(t)) return { args: t, keys: null };
    if (UD(t)) {
      let n = BD(t);
      return { args: n.map((r) => t[r]), keys: n };
    }
  }
  return { args: e, keys: null };
}
function UD(e) {
  return e && typeof e == "object" && VD(e) === jD;
}
function Ai(e, t) {
  return e.reduce((n, r, o) => ((n[r] = t[o]), n), {});
}
function qr(...e) {
  let t = kt(e),
    n = gi(e),
    { args: r, keys: o } = Ti(e);
  if (r.length === 0) return oe([], t);
  let i = new $($D(r, t, o ? (s) => Ai(o, s) : ke));
  return n ? i.pipe(xi(n)) : i;
}
function $D(e, t, n = ke) {
  return (r) => {
    _f(
      t,
      () => {
        let { length: o } = e,
          i = new Array(o),
          s = o,
          l = o;
        for (let u = 0; u < o; u++)
          _f(
            t,
            () => {
              let f = oe(e[u], t),
                g = !1;
              f.subscribe(
                L(
                  r,
                  (h) => {
                    (i[u] = h), g || ((g = !0), l--), l || r.next(n(i.slice()));
                  },
                  () => {
                    --s || r.complete();
                  }
                )
              );
            },
            r
          );
      },
      r
    );
  };
}
function _f(e, t, n) {
  e ? xe(n, e, t) : t();
}
function Mf(e, t, n, r, o, i, s, l) {
  let u = [],
    f = 0,
    g = 0,
    h = !1,
    w = () => {
      h && !u.length && !f && t.complete();
    },
    v = (I) => (f < r ? D(I) : u.push(I)),
    D = (I) => {
      i && t.next(I), f++;
      let E = !1;
      ue(n(I, g++)).subscribe(
        L(
          t,
          (x) => {
            o?.(x), i ? v(x) : t.next(x);
          },
          () => {
            E = !0;
          },
          void 0,
          () => {
            if (E)
              try {
                for (f--; u.length && f < r; ) {
                  let x = u.shift();
                  s ? xe(t, s, () => D(x)) : D(x);
                }
                w();
              } catch (x) {
                t.error(x);
              }
          }
        )
      );
    };
  return (
    e.subscribe(
      L(t, v, () => {
        (h = !0), w();
      })
    ),
    () => {
      l?.();
    }
  );
}
function ge(e, t, n = 1 / 0) {
  return N(t)
    ? ge((r, o) => O((i, s) => t(r, i, o, s))(ue(e(r, o))), n)
    : (typeof t == "number" && (n = t), H((r, o) => Mf(r, o, e, n)));
}
function Ka(e = 1 / 0) {
  return ge(ke, e);
}
function Sf() {
  return Ka(1);
}
function Xn(...e) {
  return Sf()(oe(e, kt(e)));
}
function Ni(e) {
  return new $((t) => {
    ue(e()).subscribe(t);
  });
}
function Xa(...e) {
  let t = gi(e),
    { args: n, keys: r } = Ti(e),
    o = new $((i) => {
      let { length: s } = n;
      if (!s) {
        i.complete();
        return;
      }
      let l = new Array(s),
        u = s,
        f = s;
      for (let g = 0; g < s; g++) {
        let h = !1;
        ue(n[g]).subscribe(
          L(
            i,
            (w) => {
              h || ((h = !0), f--), (l[g] = w);
            },
            () => u--,
            void 0,
            () => {
              (!u || !h) && (f || i.next(r ? Ai(r, l) : l), i.complete());
            }
          )
        );
      }
    });
  return t ? o.pipe(xi(t)) : o;
}
function Ve(e, t) {
  return H((n, r) => {
    let o = 0;
    n.subscribe(L(r, (i) => e.call(t, i, o++) && r.next(i)));
  });
}
function Lt(e) {
  return H((t, n) => {
    let r = null,
      o = !1,
      i;
    (r = t.subscribe(
      L(n, void 0, void 0, (s) => {
        (i = ue(e(s, Lt(e)(t)))),
          r ? (r.unsubscribe(), (r = null), i.subscribe(n)) : (o = !0);
      })
    )),
      o && (r.unsubscribe(), (r = null), i.subscribe(n));
  });
}
function xf(e, t, n, r, o) {
  return (i, s) => {
    let l = n,
      u = t,
      f = 0;
    i.subscribe(
      L(
        s,
        (g) => {
          let h = f++;
          (u = l ? e(u, g, h) : ((l = !0), g)), r && s.next(u);
        },
        o &&
          (() => {
            l && s.next(u), s.complete();
          })
      )
    );
  };
}
function Vt(e, t) {
  return N(t) ? ge(e, t, 1) : ge(e, 1);
}
function jt(e) {
  return H((t, n) => {
    let r = !1;
    t.subscribe(
      L(
        n,
        (o) => {
          (r = !0), n.next(o);
        },
        () => {
          r || n.next(e), n.complete();
        }
      )
    );
  });
}
function bt(e) {
  return e <= 0
    ? () => Le
    : H((t, n) => {
        let r = 0;
        t.subscribe(
          L(n, (o) => {
            ++r <= e && (n.next(o), e <= r && n.complete());
          })
        );
      });
}
function Ja(e) {
  return O(() => e);
}
function Ri(e = HD) {
  return H((t, n) => {
    let r = !1;
    t.subscribe(
      L(
        n,
        (o) => {
          (r = !0), n.next(o);
        },
        () => (r ? n.complete() : n.error(e()))
      )
    );
  });
}
function HD() {
  return new Je();
}
function mn(e) {
  return H((t, n) => {
    try {
      t.subscribe(n);
    } finally {
      n.add(e);
    }
  });
}
function lt(e, t) {
  let n = arguments.length >= 2;
  return (r) =>
    r.pipe(
      e ? Ve((o, i) => e(o, i, r)) : ke,
      bt(1),
      n ? jt(t) : Ri(() => new Je())
    );
}
function Jn(e) {
  return e <= 0
    ? () => Le
    : H((t, n) => {
        let r = [];
        t.subscribe(
          L(
            n,
            (o) => {
              r.push(o), e < r.length && r.shift();
            },
            () => {
              for (let o of r) n.next(o);
              n.complete();
            },
            void 0,
            () => {
              r = null;
            }
          )
        );
      });
}
function ec(e, t) {
  let n = arguments.length >= 2;
  return (r) =>
    r.pipe(
      e ? Ve((o, i) => e(o, i, r)) : ke,
      Jn(1),
      n ? jt(t) : Ri(() => new Je())
    );
}
function tc(e, t) {
  return H(xf(e, t, arguments.length >= 2, !0));
}
function nc(...e) {
  let t = kt(e);
  return H((n, r) => {
    (t ? Xn(e, n, t) : Xn(e, n)).subscribe(r);
  });
}
function Te(e, t) {
  return H((n, r) => {
    let o = null,
      i = 0,
      s = !1,
      l = () => s && !o && r.complete();
    n.subscribe(
      L(
        r,
        (u) => {
          o?.unsubscribe();
          let f = 0,
            g = i++;
          ue(e(u, g)).subscribe(
            (o = L(
              r,
              (h) => r.next(t ? t(u, h, g, f++) : h),
              () => {
                (o = null), l();
              }
            ))
          );
        },
        () => {
          (s = !0), l();
        }
      )
    );
  });
}
function rc(e) {
  return H((t, n) => {
    ue(e).subscribe(L(n, () => n.complete(), Gr)), !n.closed && t.subscribe(n);
  });
}
function ye(e, t, n) {
  let r = N(e) || t || n ? { next: e, error: t, complete: n } : e;
  return r
    ? H((o, i) => {
        var s;
        (s = r.subscribe) === null || s === void 0 || s.call(r);
        let l = !0;
        o.subscribe(
          L(
            i,
            (u) => {
              var f;
              (f = r.next) === null || f === void 0 || f.call(r, u), i.next(u);
            },
            () => {
              var u;
              (l = !1),
                (u = r.complete) === null || u === void 0 || u.call(r),
                i.complete();
            },
            (u) => {
              var f;
              (l = !1),
                (f = r.error) === null || f === void 0 || f.call(r, u),
                i.error(u);
            },
            () => {
              var u, f;
              l && ((u = r.unsubscribe) === null || u === void 0 || u.call(r)),
                (f = r.finalize) === null || f === void 0 || f.call(r);
            }
          )
        );
      })
    : ke;
}
var ph = "https://g.co/ng/security#xss",
  _ = class extends Error {
    constructor(t, n) {
      super(us(t, n)), (this.code = t);
    }
  };
function us(e, t) {
  return `${`NG0${Math.abs(e)}`}${t ? ": " + t : ""}`;
}
function ds(e) {
  return { toString: e }.toString();
}
var vc = globalThis;
function Y(e) {
  for (let t in e) if (e[t] === Y) return t;
  throw Error("Could not find renamed property on target object.");
}
function zD(e, t) {
  for (let n in t) t.hasOwnProperty(n) && !e.hasOwnProperty(n) && (e[n] = t[n]);
}
function Ae(e) {
  if (typeof e == "string") return e;
  if (Array.isArray(e)) return "[" + e.map(Ae).join(", ") + "]";
  if (e == null) return "" + e;
  if (e.overriddenName) return `${e.overriddenName}`;
  if (e.name) return `${e.name}`;
  let t = e.toString();
  if (t == null) return "" + t;
  let n = t.indexOf(`
`);
  return n === -1 ? t : t.substring(0, n);
}
function Tf(e, t) {
  return e == null || e === ""
    ? t === null
      ? ""
      : t
    : t == null || t === ""
    ? e
    : e + " " + t;
}
var GD = Y({ __forward_ref__: Y });
function yr(e) {
  return (
    (e.__forward_ref__ = yr),
    (e.toString = function () {
      return Ae(this());
    }),
    e
  );
}
function Ie(e) {
  return gh(e) ? e() : e;
}
function gh(e) {
  return (
    typeof e == "function" && e.hasOwnProperty(GD) && e.__forward_ref__ === yr
  );
}
function S(e) {
  return {
    token: e.token,
    providedIn: e.providedIn || null,
    factory: e.factory,
    value: void 0,
  };
}
function In(e) {
  return { providers: e.providers || [], imports: e.imports || [] };
}
function fs(e) {
  return Af(e, vh) || Af(e, yh);
}
function mh(e) {
  return fs(e) !== null;
}
function Af(e, t) {
  return e.hasOwnProperty(t) ? e[t] : null;
}
function qD(e) {
  let t = e && (e[vh] || e[yh]);
  return t || null;
}
function Nf(e) {
  return e && (e.hasOwnProperty(Rf) || e.hasOwnProperty(WD)) ? e[Rf] : null;
}
var vh = Y({ ɵprov: Y }),
  Rf = Y({ ɵinj: Y }),
  yh = Y({ ngInjectableDef: Y }),
  WD = Y({ ngInjectorDef: Y }),
  M = class {
    constructor(t, n) {
      (this._desc = t),
        (this.ngMetadataName = "InjectionToken"),
        (this.ɵprov = void 0),
        typeof n == "number"
          ? (this.__NG_ELEMENT_ID__ = n)
          : n !== void 0 &&
            (this.ɵprov = S({
              token: this,
              providedIn: n.providedIn || "root",
              factory: n.factory,
            }));
    }
    get multi() {
      return this;
    }
    toString() {
      return `InjectionToken ${this._desc}`;
    }
  };
function wh(e) {
  return e && !!e.ɵproviders;
}
var ZD = Y({ ɵcmp: Y }),
  YD = Y({ ɵdir: Y }),
  QD = Y({ ɵpipe: Y }),
  KD = Y({ ɵmod: Y }),
  $i = Y({ ɵfac: Y }),
  Yr = Y({ __NG_ELEMENT_ID__: Y }),
  Of = Y({ __NG_ENV_ID__: Y });
function tl(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function XD(e) {
  return typeof e == "function"
    ? e.name || e.toString()
    : typeof e == "object" && e != null && typeof e.type == "function"
    ? e.type.name || e.type.toString()
    : tl(e);
}
function JD(e, t) {
  let n = t ? `. Dependency path: ${t.join(" > ")} > ${e}` : "";
  throw new _(-200, e);
}
function nl(e, t) {
  throw new _(-201, !1);
}
var k = (function (e) {
    return (
      (e[(e.Default = 0)] = "Default"),
      (e[(e.Host = 1)] = "Host"),
      (e[(e.Self = 2)] = "Self"),
      (e[(e.SkipSelf = 4)] = "SkipSelf"),
      (e[(e.Optional = 8)] = "Optional"),
      e
    );
  })(k || {}),
  yc;
function Dh() {
  return yc;
}
function He(e) {
  let t = yc;
  return (yc = e), t;
}
function bh(e, t, n) {
  let r = fs(e);
  if (r && r.providedIn == "root")
    return r.value === void 0 ? (r.value = r.factory()) : r.value;
  if (n & k.Optional) return null;
  if (t !== void 0) return t;
  nl(e, "Injector");
}
var eb = {},
  Qr = eb,
  tb = "__NG_DI_FLAG__",
  Hi = "ngTempTokenPath",
  nb = "ngTokenPath",
  rb = /\n/gm,
  ob = "\u0275",
  Pf = "__source",
  rr;
function ib() {
  return rr;
}
function Bt(e) {
  let t = rr;
  return (rr = e), t;
}
function sb(e, t = k.Default) {
  if (rr === void 0) throw new _(-203, !1);
  return rr === null
    ? bh(e, void 0, t)
    : rr.get(e, t & k.Optional ? null : void 0, t);
}
function R(e, t = k.Default) {
  return (Dh() || sb)(Ie(e), t);
}
function y(e, t = k.Default) {
  return R(e, hs(t));
}
function hs(e) {
  return typeof e > "u" || typeof e == "number"
    ? e
    : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4);
}
function wc(e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let r = Ie(e[n]);
    if (Array.isArray(r)) {
      if (r.length === 0) throw new _(900, !1);
      let o,
        i = k.Default;
      for (let s = 0; s < r.length; s++) {
        let l = r[s],
          u = ab(l);
        typeof u == "number" ? (u === -1 ? (o = l.token) : (i |= u)) : (o = l);
      }
      t.push(R(o, i));
    } else t.push(R(r));
  }
  return t;
}
function ab(e) {
  return e[tb];
}
function cb(e, t, n, r) {
  let o = e[Hi];
  throw (
    (t[Pf] && o.unshift(t[Pf]),
    (e.message = lb(
      `
` + e.message,
      o,
      n,
      r
    )),
    (e[nb] = o),
    (e[Hi] = null),
    e)
  );
}
function lb(e, t, n, r = null) {
  e =
    e &&
    e.charAt(0) ===
      `
` &&
    e.charAt(1) == ob
      ? e.slice(2)
      : e;
  let o = Ae(t);
  if (Array.isArray(t)) o = t.map(Ae).join(" -> ");
  else if (typeof t == "object") {
    let i = [];
    for (let s in t)
      if (t.hasOwnProperty(s)) {
        let l = t[s];
        i.push(s + ":" + (typeof l == "string" ? JSON.stringify(l) : Ae(l)));
      }
    o = `{${i.join(", ")}}`;
  }
  return `${n}${r ? "(" + r + ")" : ""}[${o}]: ${e.replace(
    rb,
    `
  `
  )}`;
}
function ir(e, t) {
  let n = e.hasOwnProperty($i);
  return n ? e[$i] : null;
}
function rl(e, t) {
  e.forEach((n) => (Array.isArray(n) ? rl(n, t) : t(n)));
}
function Ch(e, t, n) {
  t >= e.length ? e.push(n) : e.splice(t, 0, n);
}
function zi(e, t) {
  return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0];
}
function ub(e, t, n, r) {
  let o = e.length;
  if (o == t) e.push(n, r);
  else if (o === 1) e.push(r, e[0]), (e[0] = n);
  else {
    for (o--, e.push(e[o - 1], e[o]); o > t; ) {
      let i = o - 2;
      (e[o] = e[i]), o--;
    }
    (e[t] = n), (e[t + 1] = r);
  }
}
function db(e, t, n) {
  let r = ro(e, t);
  return r >= 0 ? (e[r | 1] = n) : ((r = ~r), ub(e, r, t, n)), r;
}
function oc(e, t) {
  let n = ro(e, t);
  if (n >= 0) return e[n | 1];
}
function ro(e, t) {
  return fb(e, t, 1);
}
function fb(e, t, n) {
  let r = 0,
    o = e.length >> n;
  for (; o !== r; ) {
    let i = r + ((o - r) >> 1),
      s = e[i << n];
    if (t === s) return i << n;
    s > t ? (o = i) : (r = i + 1);
  }
  return ~(o << n);
}
var sr = {},
  ze = [],
  ar = new M(""),
  Eh = new M("", -1),
  Ih = new M(""),
  Gi = class {
    get(t, n = Qr) {
      if (n === Qr) {
        let r = new Error(`NullInjectorError: No provider for ${Ae(t)}!`);
        throw ((r.name = "NullInjectorError"), r);
      }
      return n;
    }
  },
  _h = (function (e) {
    return (e[(e.OnPush = 0)] = "OnPush"), (e[(e.Default = 1)] = "Default"), e;
  })(_h || {}),
  ft = (function (e) {
    return (
      (e[(e.Emulated = 0)] = "Emulated"),
      (e[(e.None = 2)] = "None"),
      (e[(e.ShadowDom = 3)] = "ShadowDom"),
      e
    );
  })(ft || {}),
  Ht = (function (e) {
    return (
      (e[(e.None = 0)] = "None"),
      (e[(e.SignalBased = 1)] = "SignalBased"),
      (e[(e.HasDecoratorInputTransform = 2)] = "HasDecoratorInputTransform"),
      e
    );
  })(Ht || {});
function hb(e, t, n) {
  let r = e.length;
  for (;;) {
    let o = e.indexOf(t, n);
    if (o === -1) return o;
    if (o === 0 || e.charCodeAt(o - 1) <= 32) {
      let i = t.length;
      if (o + i === r || e.charCodeAt(o + i) <= 32) return o;
    }
    n = o + 1;
  }
}
function Dc(e, t, n) {
  let r = 0;
  for (; r < n.length; ) {
    let o = n[r];
    if (typeof o == "number") {
      if (o !== 0) break;
      r++;
      let i = n[r++],
        s = n[r++],
        l = n[r++];
      e.setAttribute(t, s, l, i);
    } else {
      let i = o,
        s = n[++r];
      pb(i) ? e.setProperty(t, i, s) : e.setAttribute(t, i, s), r++;
    }
  }
  return r;
}
function Mh(e) {
  return e === 3 || e === 4 || e === 6;
}
function pb(e) {
  return e.charCodeAt(0) === 64;
}
function Kr(e, t) {
  if (!(t === null || t.length === 0))
    if (e === null || e.length === 0) e = t.slice();
    else {
      let n = -1;
      for (let r = 0; r < t.length; r++) {
        let o = t[r];
        typeof o == "number"
          ? (n = o)
          : n === 0 ||
            (n === -1 || n === 2
              ? Ff(e, n, o, null, t[++r])
              : Ff(e, n, o, null, null));
      }
    }
  return e;
}
function Ff(e, t, n, r, o) {
  let i = 0,
    s = e.length;
  if (t === -1) s = -1;
  else
    for (; i < e.length; ) {
      let l = e[i++];
      if (typeof l == "number") {
        if (l === t) {
          s = -1;
          break;
        } else if (l > t) {
          s = i - 1;
          break;
        }
      }
    }
  for (; i < e.length; ) {
    let l = e[i];
    if (typeof l == "number") break;
    if (l === n) {
      if (r === null) {
        o !== null && (e[i + 1] = o);
        return;
      } else if (r === e[i + 1]) {
        e[i + 2] = o;
        return;
      }
    }
    i++, r !== null && i++, o !== null && i++;
  }
  s !== -1 && (e.splice(s, 0, t), (i = s + 1)),
    e.splice(i++, 0, n),
    r !== null && e.splice(i++, 0, r),
    o !== null && e.splice(i++, 0, o);
}
var Sh = "ng-template";
function gb(e, t, n, r) {
  let o = 0;
  if (r) {
    for (; o < t.length && typeof t[o] == "string"; o += 2)
      if (t[o] === "class" && hb(t[o + 1].toLowerCase(), n, 0) !== -1)
        return !0;
  } else if (ol(e)) return !1;
  if (((o = t.indexOf(1, o)), o > -1)) {
    let i;
    for (; ++o < t.length && typeof (i = t[o]) == "string"; )
      if (i.toLowerCase() === n) return !0;
  }
  return !1;
}
function ol(e) {
  return e.type === 4 && e.value !== Sh;
}
function mb(e, t, n) {
  let r = e.type === 4 && !n ? Sh : e.value;
  return t === r;
}
function vb(e, t, n) {
  let r = 4,
    o = e.attrs,
    i = o !== null ? Db(o) : 0,
    s = !1;
  for (let l = 0; l < t.length; l++) {
    let u = t[l];
    if (typeof u == "number") {
      if (!s && !et(r) && !et(u)) return !1;
      if (s && et(u)) continue;
      (s = !1), (r = u | (r & 1));
      continue;
    }
    if (!s)
      if (r & 4) {
        if (
          ((r = 2 | (r & 1)),
          (u !== "" && !mb(e, u, n)) || (u === "" && t.length === 1))
        ) {
          if (et(r)) return !1;
          s = !0;
        }
      } else if (r & 8) {
        if (o === null || !gb(e, o, u, n)) {
          if (et(r)) return !1;
          s = !0;
        }
      } else {
        let f = t[++l],
          g = yb(u, o, ol(e), n);
        if (g === -1) {
          if (et(r)) return !1;
          s = !0;
          continue;
        }
        if (f !== "") {
          let h;
          if (
            (g > i ? (h = "") : (h = o[g + 1].toLowerCase()), r & 2 && f !== h)
          ) {
            if (et(r)) return !1;
            s = !0;
          }
        }
      }
  }
  return et(r) || s;
}
function et(e) {
  return (e & 1) === 0;
}
function yb(e, t, n, r) {
  if (t === null) return -1;
  let o = 0;
  if (r || !n) {
    let i = !1;
    for (; o < t.length; ) {
      let s = t[o];
      if (s === e) return o;
      if (s === 3 || s === 6) i = !0;
      else if (s === 1 || s === 2) {
        let l = t[++o];
        for (; typeof l == "string"; ) l = t[++o];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          o += 4;
          continue;
        }
      }
      o += i ? 1 : 2;
    }
    return -1;
  } else return bb(t, e);
}
function wb(e, t, n = !1) {
  for (let r = 0; r < t.length; r++) if (vb(e, t[r], n)) return !0;
  return !1;
}
function Db(e) {
  for (let t = 0; t < e.length; t++) {
    let n = e[t];
    if (Mh(n)) return t;
  }
  return e.length;
}
function bb(e, t) {
  let n = e.indexOf(4);
  if (n > -1)
    for (n++; n < e.length; ) {
      let r = e[n];
      if (typeof r == "number") return -1;
      if (r === t) return n;
      n++;
    }
  return -1;
}
function kf(e, t) {
  return e ? ":not(" + t.trim() + ")" : t;
}
function Cb(e) {
  let t = e[0],
    n = 1,
    r = 2,
    o = "",
    i = !1;
  for (; n < e.length; ) {
    let s = e[n];
    if (typeof s == "string")
      if (r & 2) {
        let l = e[++n];
        o += "[" + s + (l.length > 0 ? '="' + l + '"' : "") + "]";
      } else r & 8 ? (o += "." + s) : r & 4 && (o += " " + s);
    else
      o !== "" && !et(s) && ((t += kf(i, o)), (o = "")),
        (r = s),
        (i = i || !et(r));
    n++;
  }
  return o !== "" && (t += kf(i, o)), t;
}
function Eb(e) {
  return e.map(Cb).join(",");
}
function Ib(e) {
  let t = [],
    n = [],
    r = 1,
    o = 2;
  for (; r < e.length; ) {
    let i = e[r];
    if (typeof i == "string")
      o === 2 ? i !== "" && t.push(i, e[++r]) : o === 8 && n.push(i);
    else {
      if (!et(o)) break;
      o = i;
    }
    r++;
  }
  return { attrs: t, classes: n };
}
function We(e) {
  return ds(() => {
    let t = Rh(e),
      n = U(b({}, t), {
        decls: e.decls,
        vars: e.vars,
        template: e.template,
        consts: e.consts || null,
        ngContentSelectors: e.ngContentSelectors,
        onPush: e.changeDetection === _h.OnPush,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (t.standalone && e.dependencies) || null,
        getStandaloneInjector: null,
        signals: e.signals ?? !1,
        data: e.data || {},
        encapsulation: e.encapsulation || ft.Emulated,
        styles: e.styles || ze,
        _: null,
        schemas: e.schemas || null,
        tView: null,
        id: "",
      });
    Oh(n);
    let r = e.dependencies;
    return (
      (n.directiveDefs = Vf(r, !1)), (n.pipeDefs = Vf(r, !0)), (n.id = Sb(n)), n
    );
  });
}
function _b(e) {
  return zt(e) || xh(e);
}
function Mb(e) {
  return e !== null;
}
function _n(e) {
  return ds(() => ({
    type: e.type,
    bootstrap: e.bootstrap || ze,
    declarations: e.declarations || ze,
    imports: e.imports || ze,
    exports: e.exports || ze,
    transitiveCompileScopes: null,
    schemas: e.schemas || null,
    id: e.id || null,
  }));
}
function Lf(e, t) {
  if (e == null) return sr;
  let n = {};
  for (let r in e)
    if (e.hasOwnProperty(r)) {
      let o = e[r],
        i,
        s,
        l = Ht.None;
      Array.isArray(o)
        ? ((l = o[0]), (i = o[1]), (s = o[2] ?? i))
        : ((i = o), (s = o)),
        t ? ((n[i] = l !== Ht.None ? [r, l] : r), (t[i] = s)) : (n[i] = r);
    }
  return n;
}
function je(e) {
  return ds(() => {
    let t = Rh(e);
    return Oh(t), t;
  });
}
function zt(e) {
  return e[ZD] || null;
}
function xh(e) {
  return e[YD] || null;
}
function Th(e) {
  return e[QD] || null;
}
function Ah(e) {
  let t = zt(e) || xh(e) || Th(e);
  return t !== null ? t.standalone : !1;
}
function Nh(e, t) {
  let n = e[KD] || null;
  if (!n && t === !0)
    throw new Error(`Type ${Ae(e)} does not have '\u0275mod' property.`);
  return n;
}
function Rh(e) {
  let t = {};
  return {
    type: e.type,
    providersResolver: null,
    factory: null,
    hostBindings: e.hostBindings || null,
    hostVars: e.hostVars || 0,
    hostAttrs: e.hostAttrs || null,
    contentQueries: e.contentQueries || null,
    declaredInputs: t,
    inputTransforms: null,
    inputConfig: e.inputs || sr,
    exportAs: e.exportAs || null,
    standalone: e.standalone === !0,
    signals: e.signals === !0,
    selectors: e.selectors || ze,
    viewQuery: e.viewQuery || null,
    features: e.features || null,
    setInput: null,
    findHostDirectiveDefs: null,
    hostDirectives: null,
    inputs: Lf(e.inputs, t),
    outputs: Lf(e.outputs),
    debugInfo: null,
  };
}
function Oh(e) {
  e.features?.forEach((t) => t(e));
}
function Vf(e, t) {
  if (!e) return null;
  let n = t ? Th : _b;
  return () => (typeof e == "function" ? e() : e).map((r) => n(r)).filter(Mb);
}
function Sb(e) {
  let t = 0,
    n = [
      e.selectors,
      e.ngContentSelectors,
      e.hostVars,
      e.hostAttrs,
      e.consts,
      e.vars,
      e.decls,
      e.encapsulation,
      e.standalone,
      e.signals,
      e.exportAs,
      JSON.stringify(e.inputs),
      JSON.stringify(e.outputs),
      Object.getOwnPropertyNames(e.type.prototype),
      !!e.contentQueries,
      !!e.viewQuery,
    ].join("|");
  for (let o of n) t = (Math.imul(31, t) + o.charCodeAt(0)) << 0;
  return (t += 2147483648), "c" + t;
}
function wr(e) {
  return { ɵproviders: e };
}
function xb(...e) {
  return { ɵproviders: Ph(!0, e), ɵfromNgModule: !0 };
}
function Ph(e, ...t) {
  let n = [],
    r = new Set(),
    o,
    i = (s) => {
      n.push(s);
    };
  return (
    rl(t, (s) => {
      let l = s;
      bc(l, i, [], r) && ((o ||= []), o.push(l));
    }),
    o !== void 0 && Fh(o, i),
    n
  );
}
function Fh(e, t) {
  for (let n = 0; n < e.length; n++) {
    let { ngModule: r, providers: o } = e[n];
    il(o, (i) => {
      t(i, r);
    });
  }
}
function bc(e, t, n, r) {
  if (((e = Ie(e)), !e)) return !1;
  let o = null,
    i = Nf(e),
    s = !i && zt(e);
  if (!i && !s) {
    let u = e.ngModule;
    if (((i = Nf(u)), i)) o = u;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    o = e;
  }
  let l = r.has(o);
  if (s) {
    if (l) return !1;
    if ((r.add(o), s.dependencies)) {
      let u =
        typeof s.dependencies == "function" ? s.dependencies() : s.dependencies;
      for (let f of u) bc(f, t, n, r);
    }
  } else if (i) {
    if (i.imports != null && !l) {
      r.add(o);
      let f;
      try {
        rl(i.imports, (g) => {
          bc(g, t, n, r) && ((f ||= []), f.push(g));
        });
      } finally {
      }
      f !== void 0 && Fh(f, t);
    }
    if (!l) {
      let f = ir(o) || (() => new o());
      t({ provide: o, useFactory: f, deps: ze }, o),
        t({ provide: Ih, useValue: o, multi: !0 }, o),
        t({ provide: ar, useValue: () => R(o), multi: !0 }, o);
    }
    let u = i.providers;
    if (u != null && !l) {
      let f = e;
      il(u, (g) => {
        t(g, f);
      });
    }
  } else return !1;
  return o !== e && e.providers !== void 0;
}
function il(e, t) {
  for (let n of e)
    wh(n) && (n = n.ɵproviders), Array.isArray(n) ? il(n, t) : t(n);
}
var Tb = Y({ provide: String, useValue: Y });
function kh(e) {
  return e !== null && typeof e == "object" && Tb in e;
}
function Ab(e) {
  return !!(e && e.useExisting);
}
function Nb(e) {
  return !!(e && e.useFactory);
}
function cr(e) {
  return typeof e == "function";
}
function Rb(e) {
  return !!e.useClass;
}
var ps = new M(""),
  Li = {},
  Ob = {},
  ic;
function sl() {
  return ic === void 0 && (ic = new Gi()), ic;
}
var Ne = class {},
  Xr = class extends Ne {
    get destroyed() {
      return this._destroyed;
    }
    constructor(t, n, r, o) {
      super(),
        (this.parent = n),
        (this.source = r),
        (this.scopes = o),
        (this.records = new Map()),
        (this._ngOnDestroyHooks = new Set()),
        (this._onDestroyHooks = []),
        (this._destroyed = !1),
        Ec(t, (s) => this.processProvider(s)),
        this.records.set(Eh, er(void 0, this)),
        o.has("environment") && this.records.set(Ne, er(void 0, this));
      let i = this.records.get(ps);
      i != null && typeof i.value == "string" && this.scopes.add(i.value),
        (this.injectorDefTypes = new Set(this.get(Ih, ze, k.Self)));
    }
    destroy() {
      this.assertNotDestroyed(), (this._destroyed = !0);
      let t = W(null);
      try {
        for (let r of this._ngOnDestroyHooks) r.ngOnDestroy();
        let n = this._onDestroyHooks;
        this._onDestroyHooks = [];
        for (let r of n) r();
      } finally {
        this.records.clear(),
          this._ngOnDestroyHooks.clear(),
          this.injectorDefTypes.clear(),
          W(t);
      }
    }
    onDestroy(t) {
      return (
        this.assertNotDestroyed(),
        this._onDestroyHooks.push(t),
        () => this.removeOnDestroy(t)
      );
    }
    runInContext(t) {
      this.assertNotDestroyed();
      let n = Bt(this),
        r = He(void 0),
        o;
      try {
        return t();
      } finally {
        Bt(n), He(r);
      }
    }
    get(t, n = Qr, r = k.Default) {
      if ((this.assertNotDestroyed(), t.hasOwnProperty(Of))) return t[Of](this);
      r = hs(r);
      let o,
        i = Bt(this),
        s = He(void 0);
      try {
        if (!(r & k.SkipSelf)) {
          let u = this.records.get(t);
          if (u === void 0) {
            let f = Vb(t) && fs(t);
            f && this.injectableDefInScope(f)
              ? (u = er(Cc(t), Li))
              : (u = null),
              this.records.set(t, u);
          }
          if (u != null) return this.hydrate(t, u);
        }
        let l = r & k.Self ? sl() : this.parent;
        return (n = r & k.Optional && n === Qr ? null : n), l.get(t, n);
      } catch (l) {
        if (l.name === "NullInjectorError") {
          if (((l[Hi] = l[Hi] || []).unshift(Ae(t)), i)) throw l;
          return cb(l, t, "R3InjectorError", this.source);
        } else throw l;
      } finally {
        He(s), Bt(i);
      }
    }
    resolveInjectorInitializers() {
      let t = W(null),
        n = Bt(this),
        r = He(void 0),
        o;
      try {
        let i = this.get(ar, ze, k.Self);
        for (let s of i) s();
      } finally {
        Bt(n), He(r), W(t);
      }
    }
    toString() {
      let t = [],
        n = this.records;
      for (let r of n.keys()) t.push(Ae(r));
      return `R3Injector[${t.join(", ")}]`;
    }
    assertNotDestroyed() {
      if (this._destroyed) throw new _(205, !1);
    }
    processProvider(t) {
      t = Ie(t);
      let n = cr(t) ? t : Ie(t && t.provide),
        r = Fb(t);
      if (!cr(t) && t.multi === !0) {
        let o = this.records.get(n);
        o ||
          ((o = er(void 0, Li, !0)),
          (o.factory = () => wc(o.multi)),
          this.records.set(n, o)),
          (n = t),
          o.multi.push(t);
      }
      this.records.set(n, r);
    }
    hydrate(t, n) {
      let r = W(null);
      try {
        return (
          n.value === Li && ((n.value = Ob), (n.value = n.factory())),
          typeof n.value == "object" &&
            n.value &&
            Lb(n.value) &&
            this._ngOnDestroyHooks.add(n.value),
          n.value
        );
      } finally {
        W(r);
      }
    }
    injectableDefInScope(t) {
      if (!t.providedIn) return !1;
      let n = Ie(t.providedIn);
      return typeof n == "string"
        ? n === "any" || this.scopes.has(n)
        : this.injectorDefTypes.has(n);
    }
    removeOnDestroy(t) {
      let n = this._onDestroyHooks.indexOf(t);
      n !== -1 && this._onDestroyHooks.splice(n, 1);
    }
  };
function Cc(e) {
  let t = fs(e),
    n = t !== null ? t.factory : ir(e);
  if (n !== null) return n;
  if (e instanceof M) throw new _(204, !1);
  if (e instanceof Function) return Pb(e);
  throw new _(204, !1);
}
function Pb(e) {
  if (e.length > 0) throw new _(204, !1);
  let n = qD(e);
  return n !== null ? () => n.factory(e) : () => new e();
}
function Fb(e) {
  if (kh(e)) return er(void 0, e.useValue);
  {
    let t = Lh(e);
    return er(t, Li);
  }
}
function Lh(e, t, n) {
  let r;
  if (cr(e)) {
    let o = Ie(e);
    return ir(o) || Cc(o);
  } else if (kh(e)) r = () => Ie(e.useValue);
  else if (Nb(e)) r = () => e.useFactory(...wc(e.deps || []));
  else if (Ab(e)) r = () => R(Ie(e.useExisting));
  else {
    let o = Ie(e && (e.useClass || e.provide));
    if (kb(e)) r = () => new o(...wc(e.deps));
    else return ir(o) || Cc(o);
  }
  return r;
}
function er(e, t, n = !1) {
  return { factory: e, value: t, multi: n ? [] : void 0 };
}
function kb(e) {
  return !!e.deps;
}
function Lb(e) {
  return (
    e !== null && typeof e == "object" && typeof e.ngOnDestroy == "function"
  );
}
function Vb(e) {
  return typeof e == "function" || (typeof e == "object" && e instanceof M);
}
function Ec(e, t) {
  for (let n of e)
    Array.isArray(n) ? Ec(n, t) : n && wh(n) ? Ec(n.ɵproviders, t) : t(n);
}
function nt(e, t) {
  e instanceof Xr && e.assertNotDestroyed();
  let n,
    r = Bt(e),
    o = He(void 0);
  try {
    return t();
  } finally {
    Bt(r), He(o);
  }
}
function jb() {
  return Dh() !== void 0 || ib() != null;
}
function Bb(e) {
  return typeof e == "function";
}
var _t = 0,
  V = 1,
  A = 2,
  _e = 3,
  tt = 4,
  rt = 5,
  qi = 6,
  Wi = 7,
  Ct = 8,
  lr = 9,
  ht = 10,
  Me = 11,
  Jr = 12,
  jf = 13,
  oo = 14,
  pt = 15,
  eo = 16,
  tr = 17,
  gs = 18,
  ms = 19,
  Vh = 20,
  Ut = 21,
  sc = 22,
  Ge = 23,
  yn = 25,
  jh = 1;
var wn = 7,
  Zi = 8,
  Yi = 9,
  qe = 10,
  Qi = (function (e) {
    return (
      (e[(e.None = 0)] = "None"),
      (e[(e.HasTransplantedViews = 2)] = "HasTransplantedViews"),
      e
    );
  })(Qi || {});
function $t(e) {
  return Array.isArray(e) && typeof e[jh] == "object";
}
function Mt(e) {
  return Array.isArray(e) && e[jh] === !0;
}
function Bh(e) {
  return (e.flags & 4) !== 0;
}
function vs(e) {
  return e.componentOffset > -1;
}
function Uh(e) {
  return (e.flags & 1) === 1;
}
function Gt(e) {
  return !!e.template;
}
function Ic(e) {
  return (e[A] & 512) !== 0;
}
var _c = class {
  constructor(t, n, r) {
    (this.previousValue = t), (this.currentValue = n), (this.firstChange = r);
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function $h(e, t, n, r) {
  t !== null ? t.applyValueToInputSignal(t, r) : (e[n] = r);
}
function Zt() {
  return Hh;
}
function Hh(e) {
  return e.type.prototype.ngOnChanges && (e.setInput = $b), Ub;
}
Zt.ngInherit = !0;
function Ub() {
  let e = Gh(this),
    t = e?.current;
  if (t) {
    let n = e.previous;
    if (n === sr) e.previous = t;
    else for (let r in t) n[r] = t[r];
    (e.current = null), this.ngOnChanges(t);
  }
}
function $b(e, t, n, r, o) {
  let i = this.declaredInputs[r],
    s = Gh(e) || Hb(e, { previous: sr, current: null }),
    l = s.current || (s.current = {}),
    u = s.previous,
    f = u[i];
  (l[i] = new _c(f && f.currentValue, n, u === sr)), $h(e, t, o, n);
}
var zh = "__ngSimpleChanges__";
function Gh(e) {
  return e[zh] || null;
}
function Hb(e, t) {
  return (e[zh] = t);
}
var Bf = null;
var ut = function (e, t, n) {
    Bf?.(e, t, n);
  },
  zb = "svg",
  Gb = "math";
function gt(e) {
  for (; Array.isArray(e); ) e = e[_t];
  return e;
}
function qb(e, t) {
  return gt(t[e]);
}
function Ze(e, t) {
  return gt(t[e.index]);
}
function qh(e, t) {
  return e.data[t];
}
function Yt(e, t) {
  let n = t[e];
  return $t(n) ? n : n[_t];
}
function al(e) {
  return (e[A] & 128) === 128;
}
function Wb(e) {
  return Mt(e[_e]);
}
function Uf(e, t) {
  return t == null ? null : e[t];
}
function Wh(e) {
  e[tr] = 0;
}
function Zh(e) {
  e[A] & 1024 || ((e[A] |= 1024), al(e) && ws(e));
}
function ys(e) {
  return !!(e[A] & 9216 || e[Ge]?.dirty);
}
function Mc(e) {
  e[ht].changeDetectionScheduler?.notify(8),
    e[A] & 64 && (e[A] |= 1024),
    ys(e) && ws(e);
}
function ws(e) {
  e[ht].changeDetectionScheduler?.notify(0);
  let t = Dn(e);
  for (; t !== null && !(t[A] & 8192 || ((t[A] |= 8192), !al(t))); ) t = Dn(t);
}
function Yh(e, t) {
  if ((e[A] & 256) === 256) throw new _(911, !1);
  e[Ut] === null && (e[Ut] = []), e[Ut].push(t);
}
function Zb(e, t) {
  if (e[Ut] === null) return;
  let n = e[Ut].indexOf(t);
  n !== -1 && e[Ut].splice(n, 1);
}
function Dn(e) {
  let t = e[_e];
  return Mt(t) ? t[_e] : t;
}
var G = { lFrame: ip(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var Qh = !1;
function Yb() {
  return G.lFrame.elementDepthCount;
}
function Qb() {
  G.lFrame.elementDepthCount++;
}
function Kb() {
  G.lFrame.elementDepthCount--;
}
function Kh() {
  return G.bindingsEnabled;
}
function Xb() {
  return G.skipHydrationRootTNode !== null;
}
function Jb(e) {
  return G.skipHydrationRootTNode === e;
}
function eC() {
  G.skipHydrationRootTNode = null;
}
function fe() {
  return G.lFrame.lView;
}
function mt() {
  return G.lFrame.tView;
}
function Be() {
  let e = Xh();
  for (; e !== null && e.type === 64; ) e = e.parent;
  return e;
}
function Xh() {
  return G.lFrame.currentTNode;
}
function tC() {
  let e = G.lFrame,
    t = e.currentTNode;
  return e.isParent ? t : t.parent;
}
function Ds(e, t) {
  let n = G.lFrame;
  (n.currentTNode = e), (n.isParent = t);
}
function Jh() {
  return G.lFrame.isParent;
}
function nC() {
  G.lFrame.isParent = !1;
}
function ep() {
  return Qh;
}
function $f(e) {
  Qh = e;
}
function rC() {
  let e = G.lFrame,
    t = e.bindingRootIndex;
  return t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t;
}
function oC(e) {
  return (G.lFrame.bindingIndex = e);
}
function tp() {
  return G.lFrame.bindingIndex++;
}
function iC(e) {
  let t = G.lFrame,
    n = t.bindingIndex;
  return (t.bindingIndex = t.bindingIndex + e), n;
}
function sC() {
  return G.lFrame.inI18n;
}
function aC(e, t) {
  let n = G.lFrame;
  (n.bindingIndex = n.bindingRootIndex = e), Sc(t);
}
function cC() {
  return G.lFrame.currentDirectiveIndex;
}
function Sc(e) {
  G.lFrame.currentDirectiveIndex = e;
}
function lC(e) {
  let t = G.lFrame.currentDirectiveIndex;
  return t === -1 ? null : e[t];
}
function np(e) {
  G.lFrame.currentQueryIndex = e;
}
function uC(e) {
  let t = e[V];
  return t.type === 2 ? t.declTNode : t.type === 1 ? e[rt] : null;
}
function rp(e, t, n) {
  if (n & k.SkipSelf) {
    let o = t,
      i = e;
    for (; (o = o.parent), o === null && !(n & k.Host); )
      if (((o = uC(i)), o === null || ((i = i[oo]), o.type & 10))) break;
    if (o === null) return !1;
    (t = o), (e = i);
  }
  let r = (G.lFrame = op());
  return (r.currentTNode = t), (r.lView = e), !0;
}
function cl(e) {
  let t = op(),
    n = e[V];
  (G.lFrame = t),
    (t.currentTNode = n.firstChild),
    (t.lView = e),
    (t.tView = n),
    (t.contextLView = e),
    (t.bindingIndex = n.bindingStartIndex),
    (t.inI18n = !1);
}
function op() {
  let e = G.lFrame,
    t = e === null ? null : e.child;
  return t === null ? ip(e) : t;
}
function ip(e) {
  let t = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: e,
    child: null,
    inI18n: !1,
  };
  return e !== null && (e.child = t), t;
}
function sp() {
  let e = G.lFrame;
  return (G.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e;
}
var ap = sp;
function ll() {
  let e = sp();
  (e.isParent = !0),
    (e.tView = null),
    (e.selectedIndex = -1),
    (e.contextLView = null),
    (e.elementDepthCount = 0),
    (e.currentDirectiveIndex = -1),
    (e.currentNamespace = null),
    (e.bindingRootIndex = -1),
    (e.bindingIndex = -1),
    (e.currentQueryIndex = 0);
}
function io() {
  return G.lFrame.selectedIndex;
}
function bn(e) {
  G.lFrame.selectedIndex = e;
}
function cp() {
  let e = G.lFrame;
  return qh(e.tView, e.selectedIndex);
}
function dC() {
  return G.lFrame.currentNamespace;
}
var lp = !0;
function up() {
  return lp;
}
function dp(e) {
  lp = e;
}
function fC(e, t, n) {
  let { ngOnChanges: r, ngOnInit: o, ngDoCheck: i } = t.type.prototype;
  if (r) {
    let s = Hh(t);
    (n.preOrderHooks ??= []).push(e, s),
      (n.preOrderCheckHooks ??= []).push(e, s);
  }
  o && (n.preOrderHooks ??= []).push(0 - e, o),
    i &&
      ((n.preOrderHooks ??= []).push(e, i),
      (n.preOrderCheckHooks ??= []).push(e, i));
}
function fp(e, t) {
  for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
    let i = e.data[n].type.prototype,
      {
        ngAfterContentInit: s,
        ngAfterContentChecked: l,
        ngAfterViewInit: u,
        ngAfterViewChecked: f,
        ngOnDestroy: g,
      } = i;
    s && (e.contentHooks ??= []).push(-n, s),
      l &&
        ((e.contentHooks ??= []).push(n, l),
        (e.contentCheckHooks ??= []).push(n, l)),
      u && (e.viewHooks ??= []).push(-n, u),
      f &&
        ((e.viewHooks ??= []).push(n, f), (e.viewCheckHooks ??= []).push(n, f)),
      g != null && (e.destroyHooks ??= []).push(n, g);
  }
}
function Vi(e, t, n) {
  hp(e, t, 3, n);
}
function ji(e, t, n, r) {
  (e[A] & 3) === n && hp(e, t, n, r);
}
function ac(e, t) {
  let n = e[A];
  (n & 3) === t && ((n &= 16383), (n += 1), (e[A] = n));
}
function hp(e, t, n, r) {
  let o = r !== void 0 ? e[tr] & 65535 : 0,
    i = r ?? -1,
    s = t.length - 1,
    l = 0;
  for (let u = o; u < s; u++)
    if (typeof t[u + 1] == "number") {
      if (((l = t[u]), r != null && l >= r)) break;
    } else
      t[u] < 0 && (e[tr] += 65536),
        (l < i || i == -1) &&
          (hC(e, n, t, u), (e[tr] = (e[tr] & 4294901760) + u + 2)),
        u++;
}
function Hf(e, t) {
  ut(4, e, t);
  let n = W(null);
  try {
    t.call(e);
  } finally {
    W(n), ut(5, e, t);
  }
}
function hC(e, t, n, r) {
  let o = n[r] < 0,
    i = n[r + 1],
    s = o ? -n[r] : n[r],
    l = e[s];
  o
    ? e[A] >> 14 < e[tr] >> 16 &&
      (e[A] & 3) === t &&
      ((e[A] += 16384), Hf(l, i))
    : Hf(l, i);
}
var or = -1,
  Cn = class {
    constructor(t, n, r) {
      (this.factory = t),
        (this.resolving = !1),
        (this.canSeeViewProviders = n),
        (this.injectImpl = r);
    }
  };
function pC(e) {
  return e instanceof Cn;
}
function gC(e) {
  return (e.flags & 8) !== 0;
}
function mC(e) {
  return (e.flags & 16) !== 0;
}
var cc = {},
  xc = class {
    constructor(t, n) {
      (this.injector = t), (this.parentInjector = n);
    }
    get(t, n, r) {
      r = hs(r);
      let o = this.injector.get(t, cc, r);
      return o !== cc || n === cc ? o : this.parentInjector.get(t, n, r);
    }
  };
function pp(e) {
  return e !== or;
}
function Ki(e) {
  return e & 32767;
}
function vC(e) {
  return e >> 16;
}
function Xi(e, t) {
  let n = vC(e),
    r = t;
  for (; n > 0; ) (r = r[oo]), n--;
  return r;
}
var Tc = !0;
function zf(e) {
  let t = Tc;
  return (Tc = e), t;
}
var yC = 256,
  gp = yC - 1,
  mp = 5,
  wC = 0,
  dt = {};
function DC(e, t, n) {
  let r;
  typeof n == "string"
    ? (r = n.charCodeAt(0) || 0)
    : n.hasOwnProperty(Yr) && (r = n[Yr]),
    r == null && (r = n[Yr] = wC++);
  let o = r & gp,
    i = 1 << o;
  t.data[e + (o >> mp)] |= i;
}
function Ji(e, t) {
  let n = vp(e, t);
  if (n !== -1) return n;
  let r = t[V];
  r.firstCreatePass &&
    ((e.injectorIndex = t.length),
    lc(r.data, e),
    lc(t, null),
    lc(r.blueprint, null));
  let o = ul(e, t),
    i = e.injectorIndex;
  if (pp(o)) {
    let s = Ki(o),
      l = Xi(o, t),
      u = l[V].data;
    for (let f = 0; f < 8; f++) t[i + f] = l[s + f] | u[s + f];
  }
  return (t[i + 8] = o), i;
}
function lc(e, t) {
  e.push(0, 0, 0, 0, 0, 0, 0, 0, t);
}
function vp(e, t) {
  return e.injectorIndex === -1 ||
    (e.parent && e.parent.injectorIndex === e.injectorIndex) ||
    t[e.injectorIndex + 8] === null
    ? -1
    : e.injectorIndex;
}
function ul(e, t) {
  if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex;
  let n = 0,
    r = null,
    o = t;
  for (; o !== null; ) {
    if (((r = Cp(o)), r === null)) return or;
    if ((n++, (o = o[oo]), r.injectorIndex !== -1))
      return r.injectorIndex | (n << 16);
  }
  return or;
}
function Ac(e, t, n) {
  DC(e, t, n);
}
function bC(e, t) {
  if (t === "class") return e.classes;
  if (t === "style") return e.styles;
  let n = e.attrs;
  if (n) {
    let r = n.length,
      o = 0;
    for (; o < r; ) {
      let i = n[o];
      if (Mh(i)) break;
      if (i === 0) o = o + 2;
      else if (typeof i == "number")
        for (o++; o < r && typeof n[o] == "string"; ) o++;
      else {
        if (i === t) return n[o + 1];
        o = o + 2;
      }
    }
  }
  return null;
}
function yp(e, t, n) {
  if (n & k.Optional || e !== void 0) return e;
  nl(t, "NodeInjector");
}
function wp(e, t, n, r) {
  if (
    (n & k.Optional && r === void 0 && (r = null), !(n & (k.Self | k.Host)))
  ) {
    let o = e[lr],
      i = He(void 0);
    try {
      return o ? o.get(t, r, n & k.Optional) : bh(t, r, n & k.Optional);
    } finally {
      He(i);
    }
  }
  return yp(r, t, n);
}
function Dp(e, t, n, r = k.Default, o) {
  if (e !== null) {
    if (t[A] & 2048 && !(r & k.Self)) {
      let s = MC(e, t, n, r, dt);
      if (s !== dt) return s;
    }
    let i = bp(e, t, n, r, dt);
    if (i !== dt) return i;
  }
  return wp(t, n, r, o);
}
function bp(e, t, n, r, o) {
  let i = IC(n);
  if (typeof i == "function") {
    if (!rp(t, e, r)) return r & k.Host ? yp(o, n, r) : wp(t, n, r, o);
    try {
      let s;
      if (((s = i(r)), s == null && !(r & k.Optional))) nl(n);
      else return s;
    } finally {
      ap();
    }
  } else if (typeof i == "number") {
    let s = null,
      l = vp(e, t),
      u = or,
      f = r & k.Host ? t[pt][rt] : null;
    for (
      (l === -1 || r & k.SkipSelf) &&
      ((u = l === -1 ? ul(e, t) : t[l + 8]),
      u === or || !qf(r, !1)
        ? (l = -1)
        : ((s = t[V]), (l = Ki(u)), (t = Xi(u, t))));
      l !== -1;

    ) {
      let g = t[V];
      if (Gf(i, l, g.data)) {
        let h = CC(l, t, n, s, r, f);
        if (h !== dt) return h;
      }
      (u = t[l + 8]),
        u !== or && qf(r, t[V].data[l + 8] === f) && Gf(i, l, t)
          ? ((s = g), (l = Ki(u)), (t = Xi(u, t)))
          : (l = -1);
    }
  }
  return o;
}
function CC(e, t, n, r, o, i) {
  let s = t[V],
    l = s.data[e + 8],
    u = r == null ? vs(l) && Tc : r != s && (l.type & 3) !== 0,
    f = o & k.Host && i === l,
    g = EC(l, s, n, u, f);
  return g !== null ? ur(t, s, g, l) : dt;
}
function EC(e, t, n, r, o) {
  let i = e.providerIndexes,
    s = t.data,
    l = i & 1048575,
    u = e.directiveStart,
    f = e.directiveEnd,
    g = i >> 20,
    h = r ? l : l + g,
    w = o ? l + g : f;
  for (let v = h; v < w; v++) {
    let D = s[v];
    if ((v < u && n === D) || (v >= u && D.type === n)) return v;
  }
  if (o) {
    let v = s[u];
    if (v && Gt(v) && v.type === n) return u;
  }
  return null;
}
function ur(e, t, n, r) {
  let o = e[n],
    i = t.data;
  if (pC(o)) {
    let s = o;
    s.resolving && JD(XD(i[n]));
    let l = zf(s.canSeeViewProviders);
    s.resolving = !0;
    let u,
      f = s.injectImpl ? He(s.injectImpl) : null,
      g = rp(e, r, k.Default);
    try {
      (o = e[n] = s.factory(void 0, i, e, r)),
        t.firstCreatePass && n >= r.directiveStart && fC(n, i[n], t);
    } finally {
      f !== null && He(f), zf(l), (s.resolving = !1), ap();
    }
  }
  return o;
}
function IC(e) {
  if (typeof e == "string") return e.charCodeAt(0) || 0;
  let t = e.hasOwnProperty(Yr) ? e[Yr] : void 0;
  return typeof t == "number" ? (t >= 0 ? t & gp : _C) : t;
}
function Gf(e, t, n) {
  let r = 1 << e;
  return !!(n[t + (e >> mp)] & r);
}
function qf(e, t) {
  return !(e & k.Self) && !(e & k.Host && t);
}
var vn = class {
  constructor(t, n) {
    (this._tNode = t), (this._lView = n);
  }
  get(t, n, r) {
    return Dp(this._tNode, this._lView, t, hs(r), n);
  }
};
function _C() {
  return new vn(Be(), fe());
}
function so(e) {
  return ds(() => {
    let t = e.prototype.constructor,
      n = t[$i] || Nc(t),
      r = Object.prototype,
      o = Object.getPrototypeOf(e.prototype).constructor;
    for (; o && o !== r; ) {
      let i = o[$i] || Nc(o);
      if (i && i !== n) return i;
      o = Object.getPrototypeOf(o);
    }
    return (i) => new i();
  });
}
function Nc(e) {
  return gh(e)
    ? () => {
        let t = Nc(Ie(e));
        return t && t();
      }
    : ir(e);
}
function MC(e, t, n, r, o) {
  let i = e,
    s = t;
  for (; i !== null && s !== null && s[A] & 2048 && !(s[A] & 512); ) {
    let l = bp(i, s, n, r | k.Self, dt);
    if (l !== dt) return l;
    let u = i.parent;
    if (!u) {
      let f = s[Vh];
      if (f) {
        let g = f.get(n, dt, r);
        if (g !== dt) return g;
      }
      (u = Cp(s)), (s = s[oo]);
    }
    i = u;
  }
  return o;
}
function Cp(e) {
  let t = e[V],
    n = t.type;
  return n === 2 ? t.declTNode : n === 1 ? e[rt] : null;
}
function dl(e) {
  return bC(Be(), e);
}
function Wf(e, t = null, n = null, r) {
  let o = Ep(e, t, n, r);
  return o.resolveInjectorInitializers(), o;
}
function Ep(e, t = null, n = null, r, o = new Set()) {
  let i = [n || ze, xb(e)];
  return (
    (r = r || (typeof e == "object" ? void 0 : Ae(e))),
    new Xr(i, t || sl(), r || null, o)
  );
}
var qt = class e {
  static {
    this.THROW_IF_NOT_FOUND = Qr;
  }
  static {
    this.NULL = new Gi();
  }
  static create(t, n) {
    if (Array.isArray(t)) return Wf({ name: "" }, n, t, "");
    {
      let r = t.name ?? "";
      return Wf({ name: r }, t.parent, t.providers, r);
    }
  }
  static {
    this.ɵprov = S({ token: e, providedIn: "any", factory: () => R(Eh) });
  }
  static {
    this.__NG_ELEMENT_ID__ = -1;
  }
};
var SC = new M("");
SC.__NG_ELEMENT_ID__ = (e) => {
  let t = Be();
  if (t === null) throw new _(204, !1);
  if (t.type & 2) return t.value;
  if (e & k.Optional) return null;
  throw new _(204, !1);
};
var xC = "ngOriginalError";
function uc(e) {
  return e[xC];
}
var Ip = !0,
  _p = (() => {
    class e {
      static {
        this.__NG_ELEMENT_ID__ = TC;
      }
      static {
        this.__NG_ENV_ID__ = (n) => n;
      }
    }
    return e;
  })(),
  Rc = class extends _p {
    constructor(t) {
      super(), (this._lView = t);
    }
    onDestroy(t) {
      return Yh(this._lView, t), () => Zb(this._lView, t);
    }
  };
function TC() {
  return new Rc(fe());
}
var Qt = (() => {
  class e {
    constructor() {
      (this.taskId = 0),
        (this.pendingTasks = new Set()),
        (this.hasPendingTasks = new we(!1));
    }
    get _hasPendingTasks() {
      return this.hasPendingTasks.value;
    }
    add() {
      this._hasPendingTasks || this.hasPendingTasks.next(!0);
      let n = this.taskId++;
      return this.pendingTasks.add(n), n;
    }
    remove(n) {
      this.pendingTasks.delete(n),
        this.pendingTasks.size === 0 &&
          this._hasPendingTasks &&
          this.hasPendingTasks.next(!1);
    }
    ngOnDestroy() {
      this.pendingTasks.clear(),
        this._hasPendingTasks && this.hasPendingTasks.next(!1);
    }
    static {
      this.ɵprov = S({ token: e, providedIn: "root", factory: () => new e() });
    }
  }
  return e;
})();
var Oc = class extends ve {
    constructor(t = !1) {
      super(),
        (this.destroyRef = void 0),
        (this.pendingTasks = void 0),
        (this.__isAsync = t),
        jb() &&
          ((this.destroyRef = y(_p, { optional: !0 }) ?? void 0),
          (this.pendingTasks = y(Qt, { optional: !0 }) ?? void 0));
    }
    emit(t) {
      let n = W(null);
      try {
        super.next(t);
      } finally {
        W(n);
      }
    }
    subscribe(t, n, r) {
      let o = t,
        i = n || (() => null),
        s = r;
      if (t && typeof t == "object") {
        let u = t;
        (o = u.next?.bind(u)),
          (i = u.error?.bind(u)),
          (s = u.complete?.bind(u));
      }
      this.__isAsync &&
        ((i = this.wrapInTimeout(i)),
        o && (o = this.wrapInTimeout(o)),
        s && (s = this.wrapInTimeout(s)));
      let l = super.subscribe({ next: o, error: i, complete: s });
      return t instanceof le && t.add(l), l;
    }
    wrapInTimeout(t) {
      return (n) => {
        let r = this.pendingTasks?.add();
        setTimeout(() => {
          t(n), r !== void 0 && this.pendingTasks?.remove(r);
        });
      };
    }
  },
  de = Oc;
function es(...e) {}
function Mp(e) {
  let t, n;
  function r() {
    e = es;
    try {
      n !== void 0 &&
        typeof cancelAnimationFrame == "function" &&
        cancelAnimationFrame(n),
        t !== void 0 && clearTimeout(t);
    } catch {}
  }
  return (
    (t = setTimeout(() => {
      e(), r();
    })),
    typeof requestAnimationFrame == "function" &&
      (n = requestAnimationFrame(() => {
        e(), r();
      })),
    () => r()
  );
}
function Zf(e) {
  return (
    queueMicrotask(() => e()),
    () => {
      e = es;
    }
  );
}
var fl = "isAngularZone",
  ts = fl + "_ID",
  AC = 0,
  ie = class e {
    constructor(t) {
      (this.hasPendingMacrotasks = !1),
        (this.hasPendingMicrotasks = !1),
        (this.isStable = !0),
        (this.onUnstable = new de(!1)),
        (this.onMicrotaskEmpty = new de(!1)),
        (this.onStable = new de(!1)),
        (this.onError = new de(!1));
      let {
        enableLongStackTrace: n = !1,
        shouldCoalesceEventChangeDetection: r = !1,
        shouldCoalesceRunChangeDetection: o = !1,
        scheduleInRootZone: i = Ip,
      } = t;
      if (typeof Zone > "u") throw new _(908, !1);
      Zone.assertZonePatched();
      let s = this;
      (s._nesting = 0),
        (s._outer = s._inner = Zone.current),
        Zone.TaskTrackingZoneSpec &&
          (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
        n &&
          Zone.longStackTraceZoneSpec &&
          (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
        (s.shouldCoalesceEventChangeDetection = !o && r),
        (s.shouldCoalesceRunChangeDetection = o),
        (s.callbackScheduled = !1),
        (s.scheduleInRootZone = i),
        OC(s);
    }
    static isInAngularZone() {
      return typeof Zone < "u" && Zone.current.get(fl) === !0;
    }
    static assertInAngularZone() {
      if (!e.isInAngularZone()) throw new _(909, !1);
    }
    static assertNotInAngularZone() {
      if (e.isInAngularZone()) throw new _(909, !1);
    }
    run(t, n, r) {
      return this._inner.run(t, n, r);
    }
    runTask(t, n, r, o) {
      let i = this._inner,
        s = i.scheduleEventTask("NgZoneEvent: " + o, t, NC, es, es);
      try {
        return i.runTask(s, n, r);
      } finally {
        i.cancelTask(s);
      }
    }
    runGuarded(t, n, r) {
      return this._inner.runGuarded(t, n, r);
    }
    runOutsideAngular(t) {
      return this._outer.run(t);
    }
  },
  NC = {};
function hl(e) {
  if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
      e._nesting++, e.onMicrotaskEmpty.emit(null);
    } finally {
      if ((e._nesting--, !e.hasPendingMicrotasks))
        try {
          e.runOutsideAngular(() => e.onStable.emit(null));
        } finally {
          e.isStable = !0;
        }
    }
}
function RC(e) {
  if (e.isCheckStableRunning || e.callbackScheduled) return;
  e.callbackScheduled = !0;
  function t() {
    Mp(() => {
      (e.callbackScheduled = !1),
        Pc(e),
        (e.isCheckStableRunning = !0),
        hl(e),
        (e.isCheckStableRunning = !1);
    });
  }
  e.scheduleInRootZone
    ? Zone.root.run(() => {
        t();
      })
    : e._outer.run(() => {
        t();
      }),
    Pc(e);
}
function OC(e) {
  let t = () => {
      RC(e);
    },
    n = AC++;
  e._inner = e._inner.fork({
    name: "angular",
    properties: { [fl]: !0, [ts]: n, [ts + n]: !0 },
    onInvokeTask: (r, o, i, s, l, u) => {
      if (PC(u)) return r.invokeTask(i, s, l, u);
      try {
        return Yf(e), r.invokeTask(i, s, l, u);
      } finally {
        ((e.shouldCoalesceEventChangeDetection && s.type === "eventTask") ||
          e.shouldCoalesceRunChangeDetection) &&
          t(),
          Qf(e);
      }
    },
    onInvoke: (r, o, i, s, l, u, f) => {
      try {
        return Yf(e), r.invoke(i, s, l, u, f);
      } finally {
        e.shouldCoalesceRunChangeDetection &&
          !e.callbackScheduled &&
          !FC(u) &&
          t(),
          Qf(e);
      }
    },
    onHasTask: (r, o, i, s) => {
      r.hasTask(i, s),
        o === i &&
          (s.change == "microTask"
            ? ((e._hasPendingMicrotasks = s.microTask), Pc(e), hl(e))
            : s.change == "macroTask" &&
              (e.hasPendingMacrotasks = s.macroTask));
    },
    onHandleError: (r, o, i, s) => (
      r.handleError(i, s), e.runOutsideAngular(() => e.onError.emit(s)), !1
    ),
  });
}
function Pc(e) {
  e._hasPendingMicrotasks ||
  ((e.shouldCoalesceEventChangeDetection ||
    e.shouldCoalesceRunChangeDetection) &&
    e.callbackScheduled === !0)
    ? (e.hasPendingMicrotasks = !0)
    : (e.hasPendingMicrotasks = !1);
}
function Yf(e) {
  e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null));
}
function Qf(e) {
  e._nesting--, hl(e);
}
var Fc = class {
  constructor() {
    (this.hasPendingMicrotasks = !1),
      (this.hasPendingMacrotasks = !1),
      (this.isStable = !0),
      (this.onUnstable = new de()),
      (this.onMicrotaskEmpty = new de()),
      (this.onStable = new de()),
      (this.onError = new de());
  }
  run(t, n, r) {
    return t.apply(n, r);
  }
  runGuarded(t, n, r) {
    return t.apply(n, r);
  }
  runOutsideAngular(t) {
    return t();
  }
  runTask(t, n, r, o) {
    return t.apply(n, r);
  }
};
function PC(e) {
  return Sp(e, "__ignore_ng_zone__");
}
function FC(e) {
  return Sp(e, "__scheduler_tick__");
}
function Sp(e, t) {
  return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0;
}
var Et = class {
    constructor() {
      this._console = console;
    }
    handleError(t) {
      let n = this._findOriginalError(t);
      this._console.error("ERROR", t),
        n && this._console.error("ORIGINAL ERROR", n);
    }
    _findOriginalError(t) {
      let n = t && uc(t);
      for (; n && uc(n); ) n = uc(n);
      return n || null;
    }
  },
  kC = new M("", {
    providedIn: "root",
    factory: () => {
      let e = y(ie),
        t = y(Et);
      return (n) => e.runOutsideAngular(() => t.handleError(n));
    },
  });
function LC() {
  return pl(Be(), fe());
}
function pl(e, t) {
  return new Kt(Ze(e, t));
}
var Kt = (() => {
  class e {
    constructor(n) {
      this.nativeElement = n;
    }
    static {
      this.__NG_ELEMENT_ID__ = LC;
    }
  }
  return e;
})();
function xp(e) {
  return (e.flags & 128) === 128;
}
var Tp = new Map(),
  VC = 0;
function jC() {
  return VC++;
}
function BC(e) {
  Tp.set(e[ms], e);
}
function kc(e) {
  Tp.delete(e[ms]);
}
var Kf = "__ngContext__";
function dr(e, t) {
  $t(t) ? ((e[Kf] = t[ms]), BC(t)) : (e[Kf] = t);
}
function Ap(e) {
  return Rp(e[Jr]);
}
function Np(e) {
  return Rp(e[tt]);
}
function Rp(e) {
  for (; e !== null && !Mt(e); ) e = e[tt];
  return e;
}
var Lc;
function Op(e) {
  Lc = e;
}
function UC() {
  if (Lc !== void 0) return Lc;
  if (typeof document < "u") return document;
  throw new _(210, !1);
}
var gl = new M("", { providedIn: "root", factory: () => $C }),
  $C = "ng",
  ml = new M(""),
  Xt = new M("", { providedIn: "platform", factory: () => "unknown" });
var vl = new M("", {
  providedIn: "root",
  factory: () =>
    UC().body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce") ||
    null,
});
var HC = "h",
  zC = "b";
var GC = () => null;
function yl(e, t, n = !1) {
  return GC(e, t, n);
}
var Pp = !1,
  qC = new M("", { providedIn: "root", factory: () => Pp });
var Oi;
function WC() {
  if (Oi === void 0 && ((Oi = null), vc.trustedTypes))
    try {
      Oi = vc.trustedTypes.createPolicy("angular#unsafe-bypass", {
        createHTML: (e) => e,
        createScript: (e) => e,
        createScriptURL: (e) => e,
      });
    } catch {}
  return Oi;
}
function Xf(e) {
  return WC()?.createScriptURL(e) || e;
}
var ns = class {
  constructor(t) {
    this.changingThisBreaksApplicationSecurity = t;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${ph})`;
  }
};
function ao(e) {
  return e instanceof ns ? e.changingThisBreaksApplicationSecurity : e;
}
function wl(e, t) {
  let n = ZC(e);
  if (n != null && n !== t) {
    if (n === "ResourceURL" && t === "URL") return !0;
    throw new Error(`Required a safe ${t}, got a ${n} (see ${ph})`);
  }
  return n === t;
}
function ZC(e) {
  return (e instanceof ns && e.getTypeName()) || null;
}
var YC = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function Fp(e) {
  return (e = String(e)), e.match(YC) ? e : "unsafe:" + e;
}
var bs = (function (e) {
  return (
    (e[(e.NONE = 0)] = "NONE"),
    (e[(e.HTML = 1)] = "HTML"),
    (e[(e.STYLE = 2)] = "STYLE"),
    (e[(e.SCRIPT = 3)] = "SCRIPT"),
    (e[(e.URL = 4)] = "URL"),
    (e[(e.RESOURCE_URL = 5)] = "RESOURCE_URL"),
    e
  );
})(bs || {});
function QC(e) {
  let t = Lp();
  return t ? t.sanitize(bs.URL, e) || "" : wl(e, "URL") ? ao(e) : Fp(tl(e));
}
function KC(e) {
  let t = Lp();
  if (t) return Xf(t.sanitize(bs.RESOURCE_URL, e) || "");
  if (wl(e, "ResourceURL")) return Xf(ao(e));
  throw new _(904, !1);
}
function XC(e, t) {
  return (t === "src" &&
    (e === "embed" ||
      e === "frame" ||
      e === "iframe" ||
      e === "media" ||
      e === "script")) ||
    (t === "href" && (e === "base" || e === "link"))
    ? KC
    : QC;
}
function kp(e, t, n) {
  return XC(t, n)(e);
}
function Lp() {
  let e = fe();
  return e && e[ht].sanitizer;
}
function Vp(e) {
  return e instanceof Function ? e() : e;
}
var It = (function (e) {
    return (
      (e[(e.Important = 1)] = "Important"),
      (e[(e.DashCase = 2)] = "DashCase"),
      e
    );
  })(It || {}),
  JC;
function Dl(e, t) {
  return JC(e, t);
}
function nr(e, t, n, r, o) {
  if (r != null) {
    let i,
      s = !1;
    Mt(r) ? (i = r) : $t(r) && ((s = !0), (r = r[_t]));
    let l = gt(r);
    e === 0 && n !== null
      ? o == null
        ? Hp(t, n, l)
        : rs(t, n, l, o || null, !0)
      : e === 1 && n !== null
      ? rs(t, n, l, o || null, !0)
      : e === 2
      ? h0(t, l, s)
      : e === 3 && t.destroyNode(l),
      i != null && g0(t, e, i, n, o);
  }
}
function e0(e, t) {
  return e.createText(t);
}
function jp(e, t, n) {
  return e.createElement(t, n);
}
function t0(e, t) {
  Bp(e, t), (t[_t] = null), (t[rt] = null);
}
function n0(e, t, n, r, o, i) {
  (r[_t] = o), (r[rt] = t), Cs(e, r, n, 1, o, i);
}
function Bp(e, t) {
  t[ht].changeDetectionScheduler?.notify(9), Cs(e, t, t[Me], 2, null, null);
}
function r0(e) {
  let t = e[Jr];
  if (!t) return dc(e[V], e);
  for (; t; ) {
    let n = null;
    if ($t(t)) n = t[Jr];
    else {
      let r = t[qe];
      r && (n = r);
    }
    if (!n) {
      for (; t && !t[tt] && t !== e; ) $t(t) && dc(t[V], t), (t = t[_e]);
      t === null && (t = e), $t(t) && dc(t[V], t), (n = t && t[tt]);
    }
    t = n;
  }
}
function o0(e, t, n, r) {
  let o = qe + r,
    i = n.length;
  r > 0 && (n[o - 1][tt] = t),
    r < i - qe
      ? ((t[tt] = n[o]), Ch(n, qe + r, t))
      : (n.push(t), (t[tt] = null)),
    (t[_e] = n);
  let s = t[eo];
  s !== null && n !== s && Up(s, t);
  let l = t[gs];
  l !== null && l.insertView(e), Mc(t), (t[A] |= 128);
}
function Up(e, t) {
  let n = e[Yi],
    r = t[_e];
  if ($t(r)) e[A] |= Qi.HasTransplantedViews;
  else {
    let o = r[_e][pt];
    t[pt] !== o && (e[A] |= Qi.HasTransplantedViews);
  }
  n === null ? (e[Yi] = [t]) : n.push(t);
}
function bl(e, t) {
  let n = e[Yi],
    r = n.indexOf(t);
  n.splice(r, 1);
}
function Vc(e, t) {
  if (e.length <= qe) return;
  let n = qe + t,
    r = e[n];
  if (r) {
    let o = r[eo];
    o !== null && o !== e && bl(o, r), t > 0 && (e[n - 1][tt] = r[tt]);
    let i = zi(e, qe + t);
    t0(r[V], r);
    let s = i[gs];
    s !== null && s.detachView(i[V]),
      (r[_e] = null),
      (r[tt] = null),
      (r[A] &= -129);
  }
  return r;
}
function $p(e, t) {
  if (!(t[A] & 256)) {
    let n = t[Me];
    n.destroyNode && Cs(e, t, n, 3, null, null), r0(t);
  }
}
function dc(e, t) {
  if (t[A] & 256) return;
  let n = W(null);
  try {
    (t[A] &= -129),
      (t[A] |= 256),
      t[Ge] && Va(t[Ge]),
      s0(e, t),
      i0(e, t),
      t[V].type === 1 && t[Me].destroy();
    let r = t[eo];
    if (r !== null && Mt(t[_e])) {
      r !== t[_e] && bl(r, t);
      let o = t[gs];
      o !== null && o.detachView(e);
    }
    kc(t);
  } finally {
    W(n);
  }
}
function i0(e, t) {
  let n = e.cleanup,
    r = t[Wi];
  if (n !== null)
    for (let i = 0; i < n.length - 1; i += 2)
      if (typeof n[i] == "string") {
        let s = n[i + 3];
        s >= 0 ? r[s]() : r[-s].unsubscribe(), (i += 2);
      } else {
        let s = r[n[i + 1]];
        n[i].call(s);
      }
  r !== null && (t[Wi] = null);
  let o = t[Ut];
  if (o !== null) {
    t[Ut] = null;
    for (let i = 0; i < o.length; i++) {
      let s = o[i];
      s();
    }
  }
}
function s0(e, t) {
  let n;
  if (e != null && (n = e.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
      let o = t[n[r]];
      if (!(o instanceof Cn)) {
        let i = n[r + 1];
        if (Array.isArray(i))
          for (let s = 0; s < i.length; s += 2) {
            let l = o[i[s]],
              u = i[s + 1];
            ut(4, l, u);
            try {
              u.call(l);
            } finally {
              ut(5, l, u);
            }
          }
        else {
          ut(4, o, i);
          try {
            i.call(o);
          } finally {
            ut(5, o, i);
          }
        }
      }
    }
}
function a0(e, t, n) {
  return c0(e, t.parent, n);
}
function c0(e, t, n) {
  let r = t;
  for (; r !== null && r.type & 168; ) (t = r), (r = t.parent);
  if (r === null) return n[_t];
  {
    let { componentOffset: o } = r;
    if (o > -1) {
      let { encapsulation: i } = e.data[r.directiveStart + o];
      if (i === ft.None || i === ft.Emulated) return null;
    }
    return Ze(r, n);
  }
}
function rs(e, t, n, r, o) {
  e.insertBefore(t, n, r, o);
}
function Hp(e, t, n) {
  e.appendChild(t, n);
}
function Jf(e, t, n, r, o) {
  r !== null ? rs(e, t, n, r, o) : Hp(e, t, n);
}
function zp(e, t) {
  return e.parentNode(t);
}
function l0(e, t) {
  return e.nextSibling(t);
}
function u0(e, t, n) {
  return f0(e, t, n);
}
function d0(e, t, n) {
  return e.type & 40 ? Ze(e, n) : null;
}
var f0 = d0,
  eh;
function Gp(e, t, n, r) {
  let o = a0(e, r, t),
    i = t[Me],
    s = r.parent || t[rt],
    l = u0(s, r, t);
  if (o != null)
    if (Array.isArray(n))
      for (let u = 0; u < n.length; u++) Jf(i, o, n[u], l, !1);
    else Jf(i, o, n, l, !1);
  eh !== void 0 && eh(i, r, t, n, o);
}
function Wr(e, t) {
  if (t !== null) {
    let n = t.type;
    if (n & 3) return Ze(t, e);
    if (n & 4) return jc(-1, e[t.index]);
    if (n & 8) {
      let r = t.child;
      if (r !== null) return Wr(e, r);
      {
        let o = e[t.index];
        return Mt(o) ? jc(-1, o) : gt(o);
      }
    } else {
      if (n & 128) return Wr(e, t.next);
      if (n & 32) return Dl(t, e)() || gt(e[t.index]);
      {
        let r = qp(e, t);
        if (r !== null) {
          if (Array.isArray(r)) return r[0];
          let o = Dn(e[pt]);
          return Wr(o, r);
        } else return Wr(e, t.next);
      }
    }
  }
  return null;
}
function qp(e, t) {
  if (t !== null) {
    let r = e[pt][rt],
      o = t.projection;
    return r.projection[o];
  }
  return null;
}
function jc(e, t) {
  let n = qe + e + 1;
  if (n < t.length) {
    let r = t[n],
      o = r[V].firstChild;
    if (o !== null) return Wr(r, o);
  }
  return t[wn];
}
function h0(e, t, n) {
  e.removeChild(null, t, n);
}
function Cl(e, t, n, r, o, i, s) {
  for (; n != null; ) {
    if (n.type === 128) {
      n = n.next;
      continue;
    }
    let l = r[n.index],
      u = n.type;
    if (
      (s && t === 0 && (l && dr(gt(l), r), (n.flags |= 2)),
      (n.flags & 32) !== 32)
    )
      if (u & 8) Cl(e, t, n.child, r, o, i, !1), nr(t, e, o, l, i);
      else if (u & 32) {
        let f = Dl(n, r),
          g;
        for (; (g = f()); ) nr(t, e, o, g, i);
        nr(t, e, o, l, i);
      } else u & 16 ? p0(e, t, r, n, o, i) : nr(t, e, o, l, i);
    n = s ? n.projectionNext : n.next;
  }
}
function Cs(e, t, n, r, o, i) {
  Cl(n, r, e.firstChild, t, o, i, !1);
}
function p0(e, t, n, r, o, i) {
  let s = n[pt],
    u = s[rt].projection[r.projection];
  if (Array.isArray(u))
    for (let f = 0; f < u.length; f++) {
      let g = u[f];
      nr(t, e, o, g, i);
    }
  else {
    let f = u,
      g = s[_e];
    xp(r) && (f.flags |= 128), Cl(e, t, f, g, o, i, !0);
  }
}
function g0(e, t, n, r, o) {
  let i = n[wn],
    s = gt(n);
  i !== s && nr(t, e, r, i, o);
  for (let l = qe; l < n.length; l++) {
    let u = n[l];
    Cs(u[V], u, e, t, r, i);
  }
}
function m0(e, t, n, r, o) {
  if (t) o ? e.addClass(n, r) : e.removeClass(n, r);
  else {
    let i = r.indexOf("-") === -1 ? void 0 : It.DashCase;
    o == null
      ? e.removeStyle(n, r, i)
      : (typeof o == "string" &&
          o.endsWith("!important") &&
          ((o = o.slice(0, -10)), (i |= It.Important)),
        e.setStyle(n, r, o, i));
  }
}
function v0(e, t, n) {
  e.setAttribute(t, "style", n);
}
function Wp(e, t, n) {
  n === "" ? e.removeAttribute(t, "class") : e.setAttribute(t, "class", n);
}
function Zp(e, t, n) {
  let { mergedAttrs: r, classes: o, styles: i } = n;
  r !== null && Dc(e, t, r),
    o !== null && Wp(e, t, o),
    i !== null && v0(e, t, i);
}
var co = {};
function Es(e = 1) {
  Yp(mt(), fe(), io() + e, !1);
}
function Yp(e, t, n, r) {
  if (!r)
    if ((t[A] & 3) === 3) {
      let i = e.preOrderCheckHooks;
      i !== null && Vi(t, i, n);
    } else {
      let i = e.preOrderHooks;
      i !== null && ji(t, i, 0, n);
    }
  bn(n);
}
function X(e, t = k.Default) {
  let n = fe();
  if (n === null) return R(e, t);
  let r = Be();
  return Dp(r, n, Ie(e), t);
}
function Qp(e, t, n, r, o, i) {
  let s = W(null);
  try {
    let l = null;
    o & Ht.SignalBased && (l = t[r][Ft]),
      l !== null && l.transformFn !== void 0 && (i = l.transformFn(i)),
      o & Ht.HasDecoratorInputTransform &&
        (i = e.inputTransforms[r].call(t, i)),
      e.setInput !== null ? e.setInput(t, l, i, n, r) : $h(t, l, r, i);
  } finally {
    W(s);
  }
}
function y0(e, t) {
  let n = e.hostBindingOpCodes;
  if (n !== null)
    try {
      for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (o < 0) bn(~o);
        else {
          let i = o,
            s = n[++r],
            l = n[++r];
          aC(s, i);
          let u = t[i];
          l(2, u);
        }
      }
    } finally {
      bn(-1);
    }
}
function El(e, t, n, r, o, i, s, l, u, f, g) {
  let h = t.blueprint.slice();
  return (
    (h[_t] = o),
    (h[A] = r | 4 | 128 | 8 | 64),
    (f !== null || (e && e[A] & 2048)) && (h[A] |= 2048),
    Wh(h),
    (h[_e] = h[oo] = e),
    (h[Ct] = n),
    (h[ht] = s || (e && e[ht])),
    (h[Me] = l || (e && e[Me])),
    (h[lr] = u || (e && e[lr]) || null),
    (h[rt] = i),
    (h[ms] = jC()),
    (h[qi] = g),
    (h[Vh] = f),
    (h[pt] = t.type == 2 ? e[pt] : h),
    h
  );
}
function Il(e, t, n, r, o) {
  let i = e.data[t];
  if (i === null) (i = w0(e, t, n, r, o)), sC() && (i.flags |= 32);
  else if (i.type & 64) {
    (i.type = n), (i.value = r), (i.attrs = o);
    let s = tC();
    i.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return Ds(i, !0), i;
}
function w0(e, t, n, r, o) {
  let i = Xh(),
    s = Jh(),
    l = s ? i : i && i.parent,
    u = (e.data[t] = M0(e, l, n, t, r, o));
  return (
    e.firstChild === null && (e.firstChild = u),
    i !== null &&
      (s
        ? i.child == null && u.parent !== null && (i.child = u)
        : i.next === null && ((i.next = u), (u.prev = i))),
    u
  );
}
function Kp(e, t, n, r) {
  if (n === 0) return -1;
  let o = t.length;
  for (let i = 0; i < n; i++) t.push(r), e.blueprint.push(r), e.data.push(null);
  return o;
}
function Xp(e, t, n, r, o) {
  let i = io(),
    s = r & 2;
  try {
    bn(-1), s && t.length > yn && Yp(e, t, yn, !1), ut(s ? 2 : 0, o), n(r, o);
  } finally {
    bn(i), ut(s ? 3 : 1, o);
  }
}
function Jp(e, t, n) {
  if (Bh(t)) {
    let r = W(null);
    try {
      let o = t.directiveStart,
        i = t.directiveEnd;
      for (let s = o; s < i; s++) {
        let l = e.data[s];
        if (l.contentQueries) {
          let u = n[s];
          l.contentQueries(1, u, s);
        }
      }
    } finally {
      W(r);
    }
  }
}
function D0(e, t, n) {
  Kh() && (P0(e, t, n, Ze(n, t)), (n.flags & 64) === 64 && rg(e, t, n));
}
function b0(e, t, n = Ze) {
  let r = t.localNames;
  if (r !== null) {
    let o = t.index + 1;
    for (let i = 0; i < r.length; i += 2) {
      let s = r[i + 1],
        l = s === -1 ? n(t, e) : e[s];
      e[o++] = l;
    }
  }
}
function eg(e) {
  let t = e.tView;
  return t === null || t.incompleteFirstPass
    ? (e.tView = tg(
        1,
        null,
        e.template,
        e.decls,
        e.vars,
        e.directiveDefs,
        e.pipeDefs,
        e.viewQuery,
        e.schemas,
        e.consts,
        e.id
      ))
    : t;
}
function tg(e, t, n, r, o, i, s, l, u, f, g) {
  let h = yn + r,
    w = h + o,
    v = C0(h, w),
    D = typeof f == "function" ? f() : f;
  return (v[V] = {
    type: e,
    blueprint: v,
    template: n,
    queries: null,
    viewQuery: l,
    declTNode: t,
    data: v.slice().fill(null, h),
    bindingStartIndex: h,
    expandoStartIndex: w,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof i == "function" ? i() : i,
    pipeRegistry: typeof s == "function" ? s() : s,
    firstChild: null,
    schemas: u,
    consts: D,
    incompleteFirstPass: !1,
    ssrId: g,
  });
}
function C0(e, t) {
  let n = [];
  for (let r = 0; r < t; r++) n.push(r < e ? null : co);
  return n;
}
function E0(e, t, n, r) {
  let i = r.get(qC, Pp) || n === ft.ShadowDom,
    s = e.selectRootElement(t, i);
  return I0(s), s;
}
function I0(e) {
  _0(e);
}
var _0 = () => null;
function M0(e, t, n, r, o, i) {
  let s = t ? t.injectorIndex : -1,
    l = 0;
  return (
    Xb() && (l |= 128),
    {
      type: n,
      index: r,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      propertyBindings: null,
      flags: l,
      providerIndexes: 0,
      value: o,
      attrs: i,
      mergedAttrs: null,
      localNames: null,
      initialInputs: void 0,
      inputs: null,
      outputs: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: t,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0,
    }
  );
}
function th(e, t, n, r, o) {
  for (let i in t) {
    if (!t.hasOwnProperty(i)) continue;
    let s = t[i];
    if (s === void 0) continue;
    r ??= {};
    let l,
      u = Ht.None;
    Array.isArray(s) ? ((l = s[0]), (u = s[1])) : (l = s);
    let f = i;
    if (o !== null) {
      if (!o.hasOwnProperty(i)) continue;
      f = o[i];
    }
    e === 0 ? nh(r, n, f, l, u) : nh(r, n, f, l);
  }
  return r;
}
function nh(e, t, n, r, o) {
  let i;
  e.hasOwnProperty(n) ? (i = e[n]).push(t, r) : (i = e[n] = [t, r]),
    o !== void 0 && i.push(o);
}
function S0(e, t, n) {
  let r = t.directiveStart,
    o = t.directiveEnd,
    i = e.data,
    s = t.attrs,
    l = [],
    u = null,
    f = null;
  for (let g = r; g < o; g++) {
    let h = i[g],
      w = n ? n.get(h) : null,
      v = w ? w.inputs : null,
      D = w ? w.outputs : null;
    (u = th(0, h.inputs, g, u, v)), (f = th(1, h.outputs, g, f, D));
    let I = u !== null && s !== null && !ol(t) ? G0(u, g, s) : null;
    l.push(I);
  }
  u !== null &&
    (u.hasOwnProperty("class") && (t.flags |= 8),
    u.hasOwnProperty("style") && (t.flags |= 16)),
    (t.initialInputs = l),
    (t.inputs = u),
    (t.outputs = f);
}
function x0(e) {
  return e === "class"
    ? "className"
    : e === "for"
    ? "htmlFor"
    : e === "formaction"
    ? "formAction"
    : e === "innerHtml"
    ? "innerHTML"
    : e === "readonly"
    ? "readOnly"
    : e === "tabindex"
    ? "tabIndex"
    : e;
}
function T0(e, t, n, r, o, i, s, l) {
  let u = Ze(t, n),
    f = t.inputs,
    g;
  !l && f != null && (g = f[r])
    ? (Ml(e, n, g, r, o), vs(t) && A0(n, t.index))
    : t.type & 3
    ? ((r = x0(r)),
      (o = s != null ? s(o, t.value || "", r) : o),
      i.setProperty(u, r, o))
    : t.type & 12;
}
function A0(e, t) {
  let n = Yt(t, e);
  n[A] & 16 || (n[A] |= 64);
}
function N0(e, t, n, r) {
  if (Kh()) {
    let o = r === null ? null : { "": -1 },
      i = k0(e, n),
      s,
      l;
    i === null ? (s = l = null) : ([s, l] = i),
      s !== null && ng(e, t, n, s, o, l),
      o && L0(n, r, o);
  }
  n.mergedAttrs = Kr(n.mergedAttrs, n.attrs);
}
function ng(e, t, n, r, o, i) {
  for (let f = 0; f < r.length; f++) Ac(Ji(n, t), e, r[f].type);
  j0(n, e.data.length, r.length);
  for (let f = 0; f < r.length; f++) {
    let g = r[f];
    g.providersResolver && g.providersResolver(g);
  }
  let s = !1,
    l = !1,
    u = Kp(e, t, r.length, null);
  for (let f = 0; f < r.length; f++) {
    let g = r[f];
    (n.mergedAttrs = Kr(n.mergedAttrs, g.hostAttrs)),
      B0(e, n, t, u, g),
      V0(u, g, o),
      g.contentQueries !== null && (n.flags |= 4),
      (g.hostBindings !== null || g.hostAttrs !== null || g.hostVars !== 0) &&
        (n.flags |= 64);
    let h = g.type.prototype;
    !s &&
      (h.ngOnChanges || h.ngOnInit || h.ngDoCheck) &&
      ((e.preOrderHooks ??= []).push(n.index), (s = !0)),
      !l &&
        (h.ngOnChanges || h.ngDoCheck) &&
        ((e.preOrderCheckHooks ??= []).push(n.index), (l = !0)),
      u++;
  }
  S0(e, n, i);
}
function R0(e, t, n, r, o) {
  let i = o.hostBindings;
  if (i) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let l = ~t.index;
    O0(s) != l && s.push(l), s.push(n, r, i);
  }
}
function O0(e) {
  let t = e.length;
  for (; t > 0; ) {
    let n = e[--t];
    if (typeof n == "number" && n < 0) return n;
  }
  return 0;
}
function P0(e, t, n, r) {
  let o = n.directiveStart,
    i = n.directiveEnd;
  vs(n) && U0(t, n, e.data[o + n.componentOffset]),
    e.firstCreatePass || Ji(n, t),
    dr(r, t);
  let s = n.initialInputs;
  for (let l = o; l < i; l++) {
    let u = e.data[l],
      f = ur(t, e, l, n);
    if ((dr(f, t), s !== null && z0(t, l - o, f, u, n, s), Gt(u))) {
      let g = Yt(n.index, t);
      g[Ct] = ur(t, e, l, n);
    }
  }
}
function rg(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd,
    i = n.index,
    s = cC();
  try {
    bn(i);
    for (let l = r; l < o; l++) {
      let u = e.data[l],
        f = t[l];
      Sc(l),
        (u.hostBindings !== null || u.hostVars !== 0 || u.hostAttrs !== null) &&
          F0(u, f);
    }
  } finally {
    bn(-1), Sc(s);
  }
}
function F0(e, t) {
  e.hostBindings !== null && e.hostBindings(1, t);
}
function k0(e, t) {
  let n = e.directiveRegistry,
    r = null,
    o = null;
  if (n)
    for (let i = 0; i < n.length; i++) {
      let s = n[i];
      if (wb(t, s.selectors, !1))
        if ((r || (r = []), Gt(s)))
          if (s.findHostDirectiveDefs !== null) {
            let l = [];
            (o = o || new Map()),
              s.findHostDirectiveDefs(s, l, o),
              r.unshift(...l, s);
            let u = l.length;
            Bc(e, t, u);
          } else r.unshift(s), Bc(e, t, 0);
        else
          (o = o || new Map()), s.findHostDirectiveDefs?.(s, r, o), r.push(s);
    }
  return r === null ? null : [r, o];
}
function Bc(e, t, n) {
  (t.componentOffset = n), (e.components ??= []).push(t.index);
}
function L0(e, t, n) {
  if (t) {
    let r = (e.localNames = []);
    for (let o = 0; o < t.length; o += 2) {
      let i = n[t[o + 1]];
      if (i == null) throw new _(-301, !1);
      r.push(t[o], i);
    }
  }
}
function V0(e, t, n) {
  if (n) {
    if (t.exportAs)
      for (let r = 0; r < t.exportAs.length; r++) n[t.exportAs[r]] = e;
    Gt(t) && (n[""] = e);
  }
}
function j0(e, t, n) {
  (e.flags |= 1),
    (e.directiveStart = t),
    (e.directiveEnd = t + n),
    (e.providerIndexes = t);
}
function B0(e, t, n, r, o) {
  e.data[r] = o;
  let i = o.factory || (o.factory = ir(o.type, !0)),
    s = new Cn(i, Gt(o), X);
  (e.blueprint[r] = s), (n[r] = s), R0(e, t, r, Kp(e, n, o.hostVars, co), o);
}
function U0(e, t, n) {
  let r = Ze(t, e),
    o = eg(n),
    i = e[ht].rendererFactory,
    s = 16;
  n.signals ? (s = 4096) : n.onPush && (s = 64);
  let l = _l(
    e,
    El(e, o, null, s, r, t, null, i.createRenderer(r, n), null, null, null)
  );
  e[t.index] = l;
}
function $0(e, t, n, r, o, i) {
  let s = Ze(e, t);
  H0(t[Me], s, i, e.value, n, r, o);
}
function H0(e, t, n, r, o, i, s) {
  if (i == null) e.removeAttribute(t, o, n);
  else {
    let l = s == null ? tl(i) : s(i, r || "", o);
    e.setAttribute(t, o, l, n);
  }
}
function z0(e, t, n, r, o, i) {
  let s = i[t];
  if (s !== null)
    for (let l = 0; l < s.length; ) {
      let u = s[l++],
        f = s[l++],
        g = s[l++],
        h = s[l++];
      Qp(r, n, u, f, g, h);
    }
}
function G0(e, t, n) {
  let r = null,
    o = 0;
  for (; o < n.length; ) {
    let i = n[o];
    if (i === 0) {
      o += 4;
      continue;
    } else if (i === 5) {
      o += 2;
      continue;
    }
    if (typeof i == "number") break;
    if (e.hasOwnProperty(i)) {
      r === null && (r = []);
      let s = e[i];
      for (let l = 0; l < s.length; l += 3)
        if (s[l] === t) {
          r.push(i, s[l + 1], s[l + 2], n[o + 1]);
          break;
        }
    }
    o += 2;
  }
  return r;
}
function q0(e, t, n, r) {
  return [e, !0, 0, t, null, r, null, n, null, null];
}
function og(e, t) {
  let n = e.contentQueries;
  if (n !== null) {
    let r = W(null);
    try {
      for (let o = 0; o < n.length; o += 2) {
        let i = n[o],
          s = n[o + 1];
        if (s !== -1) {
          let l = e.data[s];
          np(i), l.contentQueries(2, t[s], s);
        }
      }
    } finally {
      W(r);
    }
  }
}
function _l(e, t) {
  return e[Jr] ? (e[jf][tt] = t) : (e[Jr] = t), (e[jf] = t), t;
}
function Uc(e, t, n) {
  np(0);
  let r = W(null);
  try {
    t(e, n);
  } finally {
    W(r);
  }
}
function W0(e) {
  return (e[Wi] ??= []);
}
function Z0(e) {
  return (e.cleanup ??= []);
}
function ig(e, t) {
  let n = e[lr],
    r = n ? n.get(Et, null) : null;
  r && r.handleError(t);
}
function Ml(e, t, n, r, o) {
  for (let i = 0; i < n.length; ) {
    let s = n[i++],
      l = n[i++],
      u = n[i++],
      f = t[s],
      g = e.data[s];
    Qp(g, f, r, l, u, o);
  }
}
function Y0(e, t) {
  let n = Yt(t, e),
    r = n[V];
  Q0(r, n);
  let o = n[_t];
  o !== null && n[qi] === null && (n[qi] = yl(o, n[lr])), sg(r, n, n[Ct]);
}
function Q0(e, t) {
  for (let n = t.length; n < e.blueprint.length; n++) t.push(e.blueprint[n]);
}
function sg(e, t, n) {
  cl(t);
  try {
    let r = e.viewQuery;
    r !== null && Uc(1, r, n);
    let o = e.template;
    o !== null && Xp(e, t, o, 1, n),
      e.firstCreatePass && (e.firstCreatePass = !1),
      t[gs]?.finishViewCreation(e),
      e.staticContentQueries && og(e, t),
      e.staticViewQueries && Uc(2, e.viewQuery, n);
    let i = e.components;
    i !== null && K0(t, i);
  } catch (r) {
    throw (
      (e.firstCreatePass &&
        ((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)),
      r)
    );
  } finally {
    (t[A] &= -5), ll();
  }
}
function K0(e, t) {
  for (let n = 0; n < t.length; n++) Y0(e, t[n]);
}
function rh(e, t) {
  return !t || t.firstChild === null || xp(e);
}
function X0(e, t, n, r = !0) {
  let o = t[V];
  if ((o0(o, t, e, n), r)) {
    let s = jc(n, e),
      l = t[Me],
      u = zp(l, e[wn]);
    u !== null && n0(o, e[rt], l, t, u, s);
  }
  let i = t[qi];
  i !== null && i.firstChild !== null && (i.firstChild = null);
}
function os(e, t, n, r, o = !1) {
  for (; n !== null; ) {
    if (n.type === 128) {
      n = o ? n.projectionNext : n.next;
      continue;
    }
    let i = t[n.index];
    i !== null && r.push(gt(i)), Mt(i) && J0(i, r);
    let s = n.type;
    if (s & 8) os(e, t, n.child, r);
    else if (s & 32) {
      let l = Dl(n, t),
        u;
      for (; (u = l()); ) r.push(u);
    } else if (s & 16) {
      let l = qp(t, n);
      if (Array.isArray(l)) r.push(...l);
      else {
        let u = Dn(t[pt]);
        os(u[V], u, l, r, !0);
      }
    }
    n = o ? n.projectionNext : n.next;
  }
  return r;
}
function J0(e, t) {
  for (let n = qe; n < e.length; n++) {
    let r = e[n],
      o = r[V].firstChild;
    o !== null && os(r[V], r, o, t);
  }
  e[wn] !== e[_t] && t.push(e[wn]);
}
var ag = [];
function eE(e) {
  return e[Ge] ?? tE(e);
}
function tE(e) {
  let t = ag.pop() ?? Object.create(rE);
  return (t.lView = e), t;
}
function nE(e) {
  e.lView[Ge] !== e && ((e.lView = null), ag.push(e));
}
var rE = U(b({}, Hr), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    ws(e.lView);
  },
  consumerOnSignalRead() {
    this.lView[Ge] = this;
  },
});
function oE(e) {
  let t = e[Ge] ?? Object.create(iE);
  return (t.lView = e), t;
}
var iE = U(b({}, Hr), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    let t = Dn(e.lView);
    for (; t && !cg(t[V]); ) t = Dn(t);
    t && Zh(t);
  },
  consumerOnSignalRead() {
    this.lView[Ge] = this;
  },
});
function cg(e) {
  return e.type !== 2;
}
var sE = 100;
function lg(e, t = !0, n = 0) {
  let r = e[ht],
    o = r.rendererFactory,
    i = !1;
  i || o.begin?.();
  try {
    aE(e, n);
  } catch (s) {
    throw (t && ig(e, s), s);
  } finally {
    i || (o.end?.(), r.inlineEffectRunner?.flush());
  }
}
function aE(e, t) {
  let n = ep();
  try {
    $f(!0), $c(e, t);
    let r = 0;
    for (; ys(e); ) {
      if (r === sE) throw new _(103, !1);
      r++, $c(e, 1);
    }
  } finally {
    $f(n);
  }
}
function cE(e, t, n, r) {
  let o = t[A];
  if ((o & 256) === 256) return;
  let i = !1,
    s = !1;
  !i && t[ht].inlineEffectRunner?.flush(), cl(t);
  let l = !0,
    u = null,
    f = null;
  i ||
    (cg(e)
      ? ((f = eE(t)), (u = ai(f)))
      : zd() === null
      ? ((l = !1), (f = oE(t)), (u = ai(f)))
      : t[Ge] && (Va(t[Ge]), (t[Ge] = null)));
  try {
    Wh(t), oC(e.bindingStartIndex), n !== null && Xp(e, t, n, 2, r);
    let g = (o & 3) === 3;
    if (!i)
      if (g) {
        let v = e.preOrderCheckHooks;
        v !== null && Vi(t, v, null);
      } else {
        let v = e.preOrderHooks;
        v !== null && ji(t, v, 0, null), ac(t, 0);
      }
    if ((s || lE(t), ug(t, 0), e.contentQueries !== null && og(e, t), !i))
      if (g) {
        let v = e.contentCheckHooks;
        v !== null && Vi(t, v);
      } else {
        let v = e.contentHooks;
        v !== null && ji(t, v, 1), ac(t, 1);
      }
    y0(e, t);
    let h = e.components;
    h !== null && fg(t, h, 0);
    let w = e.viewQuery;
    if ((w !== null && Uc(2, w, r), !i))
      if (g) {
        let v = e.viewCheckHooks;
        v !== null && Vi(t, v);
      } else {
        let v = e.viewHooks;
        v !== null && ji(t, v, 2), ac(t, 2);
      }
    if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[sc])) {
      for (let v of t[sc]) v();
      t[sc] = null;
    }
    i || (t[A] &= -73);
  } catch (g) {
    throw (i || ws(t), g);
  } finally {
    f !== null && (ka(f, u), l && nE(f)), ll();
  }
}
function ug(e, t) {
  for (let n = Ap(e); n !== null; n = Np(n))
    for (let r = qe; r < n.length; r++) {
      let o = n[r];
      dg(o, t);
    }
}
function lE(e) {
  for (let t = Ap(e); t !== null; t = Np(t)) {
    if (!(t[A] & Qi.HasTransplantedViews)) continue;
    let n = t[Yi];
    for (let r = 0; r < n.length; r++) {
      let o = n[r];
      Zh(o);
    }
  }
}
function uE(e, t, n) {
  let r = Yt(t, e);
  dg(r, n);
}
function dg(e, t) {
  al(e) && $c(e, t);
}
function $c(e, t) {
  let r = e[V],
    o = e[A],
    i = e[Ge],
    s = !!(t === 0 && o & 16);
  if (
    ((s ||= !!(o & 64 && t === 0)),
    (s ||= !!(o & 1024)),
    (s ||= !!(i?.dirty && La(i))),
    (s ||= !1),
    i && (i.dirty = !1),
    (e[A] &= -9217),
    s)
  )
    cE(r, e, r.template, e[Ct]);
  else if (o & 8192) {
    ug(e, 1);
    let l = r.components;
    l !== null && fg(e, l, 1);
  }
}
function fg(e, t, n) {
  for (let r = 0; r < t.length; r++) uE(e, t[r], n);
}
function Sl(e, t) {
  let n = ep() ? 64 : 1088;
  for (e[ht].changeDetectionScheduler?.notify(t); e; ) {
    e[A] |= n;
    let r = Dn(e);
    if (Ic(e) && !r) return e;
    e = r;
  }
  return null;
}
var fr = class {
  get rootNodes() {
    let t = this._lView,
      n = t[V];
    return os(n, t, n.firstChild, []);
  }
  constructor(t, n, r = !0) {
    (this._lView = t),
      (this._cdRefInjectingView = n),
      (this.notifyErrorHandler = r),
      (this._appRef = null),
      (this._attachedToViewContainer = !1);
  }
  get context() {
    return this._lView[Ct];
  }
  set context(t) {
    this._lView[Ct] = t;
  }
  get destroyed() {
    return (this._lView[A] & 256) === 256;
  }
  destroy() {
    if (this._appRef) this._appRef.detachView(this);
    else if (this._attachedToViewContainer) {
      let t = this._lView[_e];
      if (Mt(t)) {
        let n = t[Zi],
          r = n ? n.indexOf(this) : -1;
        r > -1 && (Vc(t, r), zi(n, r));
      }
      this._attachedToViewContainer = !1;
    }
    $p(this._lView[V], this._lView);
  }
  onDestroy(t) {
    Yh(this._lView, t);
  }
  markForCheck() {
    Sl(this._cdRefInjectingView || this._lView, 4);
  }
  detach() {
    this._lView[A] &= -129;
  }
  reattach() {
    Mc(this._lView), (this._lView[A] |= 128);
  }
  detectChanges() {
    (this._lView[A] |= 1024), lg(this._lView, this.notifyErrorHandler);
  }
  checkNoChanges() {}
  attachToViewContainerRef() {
    if (this._appRef) throw new _(902, !1);
    this._attachedToViewContainer = !0;
  }
  detachFromAppRef() {
    this._appRef = null;
    let t = Ic(this._lView),
      n = this._lView[eo];
    n !== null && !t && bl(n, this._lView), Bp(this._lView[V], this._lView);
  }
  attachToAppRef(t) {
    if (this._attachedToViewContainer) throw new _(902, !1);
    this._appRef = t;
    let n = Ic(this._lView),
      r = this._lView[eo];
    r !== null && !n && Up(r, this._lView), Mc(this._lView);
  }
};
var GO = new RegExp(`^(\\d+)*(${zC}|${HC})*(.*)`);
var dE = () => null;
function oh(e, t) {
  return dE(e, t);
}
var hr = class {},
  Is = new M("", { providedIn: "root", factory: () => !1 });
var hg = new M(""),
  pg = new M(""),
  Hc = class {},
  is = class {};
function fE(e) {
  let t = Error(`No component factory found for ${Ae(e)}.`);
  return (t[hE] = e), t;
}
var hE = "ngComponent";
var zc = class {
    resolveComponentFactory(t) {
      throw fE(t);
    }
  },
  pr = class {
    static {
      this.NULL = new zc();
    }
  },
  gr = class {},
  Mn = (() => {
    class e {
      constructor() {
        this.destroyNode = null;
      }
      static {
        this.__NG_ELEMENT_ID__ = () => pE();
      }
    }
    return e;
  })();
function pE() {
  let e = fe(),
    t = Be(),
    n = Yt(t.index, e);
  return ($t(n) ? n : e)[Me];
}
var gE = (() => {
  class e {
    static {
      this.ɵprov = S({ token: e, providedIn: "root", factory: () => null });
    }
  }
  return e;
})();
function Gc(e, t, n) {
  let r = n ? e.styles : null,
    o = n ? e.classes : null,
    i = 0;
  if (t !== null)
    for (let s = 0; s < t.length; s++) {
      let l = t[s];
      if (typeof l == "number") i = l;
      else if (i == 1) o = Tf(o, l);
      else if (i == 2) {
        let u = l,
          f = t[++s];
        r = Tf(r, u + ": " + f + ";");
      }
    }
  n ? (e.styles = r) : (e.stylesWithoutHost = r),
    n ? (e.classes = o) : (e.classesWithoutHost = o);
}
var ss = class extends pr {
  constructor(t) {
    super(), (this.ngModule = t);
  }
  resolveComponentFactory(t) {
    let n = zt(t);
    return new mr(n, this.ngModule);
  }
};
function ih(e, t) {
  let n = [];
  for (let r in e) {
    if (!e.hasOwnProperty(r)) continue;
    let o = e[r];
    if (o === void 0) continue;
    let i = Array.isArray(o),
      s = i ? o[0] : o,
      l = i ? o[1] : Ht.None;
    t
      ? n.push({
          propName: s,
          templateName: r,
          isSignal: (l & Ht.SignalBased) !== 0,
        })
      : n.push({ propName: s, templateName: r });
  }
  return n;
}
function mE(e) {
  let t = e.toLowerCase();
  return t === "svg" ? zb : t === "math" ? Gb : null;
}
var mr = class extends is {
    get inputs() {
      let t = this.componentDef,
        n = t.inputTransforms,
        r = ih(t.inputs, !0);
      if (n !== null)
        for (let o of r)
          n.hasOwnProperty(o.propName) && (o.transform = n[o.propName]);
      return r;
    }
    get outputs() {
      return ih(this.componentDef.outputs, !1);
    }
    constructor(t, n) {
      super(),
        (this.componentDef = t),
        (this.ngModule = n),
        (this.componentType = t.type),
        (this.selector = Eb(t.selectors)),
        (this.ngContentSelectors = t.ngContentSelectors
          ? t.ngContentSelectors
          : []),
        (this.isBoundToModule = !!n);
    }
    create(t, n, r, o) {
      let i = W(null);
      try {
        o = o || this.ngModule;
        let s = o instanceof Ne ? o : o?.injector;
        s &&
          this.componentDef.getStandaloneInjector !== null &&
          (s = this.componentDef.getStandaloneInjector(s) || s);
        let l = s ? new xc(t, s) : t,
          u = l.get(gr, null);
        if (u === null) throw new _(407, !1);
        let f = l.get(gE, null),
          g = l.get(hr, null),
          h = {
            rendererFactory: u,
            sanitizer: f,
            inlineEffectRunner: null,
            changeDetectionScheduler: g,
          },
          w = u.createRenderer(null, this.componentDef),
          v = this.componentDef.selectors[0][0] || "div",
          D = r
            ? E0(w, r, this.componentDef.encapsulation, l)
            : jp(w, v, mE(v)),
          I = 512;
        this.componentDef.signals
          ? (I |= 4096)
          : this.componentDef.onPush || (I |= 16);
        let E = null;
        D !== null && (E = yl(D, l, !0));
        let x = tg(0, null, null, 1, 0, null, null, null, null, null, null),
          ee = El(null, x, null, I, null, null, h, w, l, null, E);
        cl(ee);
        let j,
          ce,
          he = null;
        try {
          let ne = this.componentDef,
            Ee,
            cn = null;
          ne.findHostDirectiveDefs
            ? ((Ee = []),
              (cn = new Map()),
              ne.findHostDirectiveDefs(ne, Ee, cn),
              Ee.push(ne))
            : (Ee = [ne]);
          let be = vE(ee, D);
          (he = yE(be, D, ne, Ee, ee, h, w)),
            (ce = qh(x, yn)),
            D && bE(w, ne, D, r),
            n !== void 0 && CE(ce, this.ngContentSelectors, n),
            (j = DE(he, ne, Ee, cn, ee, [EE])),
            sg(x, ee, null);
        } catch (ne) {
          throw (he !== null && kc(he), kc(ee), ne);
        } finally {
          ll();
        }
        return new qc(this.componentType, j, pl(ce, ee), ee, ce);
      } finally {
        W(i);
      }
    }
  },
  qc = class extends Hc {
    constructor(t, n, r, o, i) {
      super(),
        (this.location = r),
        (this._rootLView = o),
        (this._tNode = i),
        (this.previousInputValues = null),
        (this.instance = n),
        (this.hostView = this.changeDetectorRef = new fr(o, void 0, !1)),
        (this.componentType = t);
    }
    setInput(t, n) {
      let r = this._tNode.inputs,
        o;
      if (r !== null && (o = r[t])) {
        if (
          ((this.previousInputValues ??= new Map()),
          this.previousInputValues.has(t) &&
            Object.is(this.previousInputValues.get(t), n))
        )
          return;
        let i = this._rootLView;
        Ml(i[V], i, o, t, n), this.previousInputValues.set(t, n);
        let s = Yt(this._tNode.index, i);
        Sl(s, 1);
      }
    }
    get injector() {
      return new vn(this._tNode, this._rootLView);
    }
    destroy() {
      this.hostView.destroy();
    }
    onDestroy(t) {
      this.hostView.onDestroy(t);
    }
  };
function vE(e, t) {
  let n = e[V],
    r = yn;
  return (e[r] = t), Il(n, r, 2, "#host", null);
}
function yE(e, t, n, r, o, i, s) {
  let l = o[V];
  wE(r, e, t, s);
  let u = null;
  t !== null && (u = yl(t, o[lr]));
  let f = i.rendererFactory.createRenderer(t, n),
    g = 16;
  n.signals ? (g = 4096) : n.onPush && (g = 64);
  let h = El(o, eg(n), null, g, o[e.index], e, i, f, null, null, u);
  return (
    l.firstCreatePass && Bc(l, e, r.length - 1), _l(o, h), (o[e.index] = h)
  );
}
function wE(e, t, n, r) {
  for (let o of e) t.mergedAttrs = Kr(t.mergedAttrs, o.hostAttrs);
  t.mergedAttrs !== null &&
    (Gc(t, t.mergedAttrs, !0), n !== null && Zp(r, n, t));
}
function DE(e, t, n, r, o, i) {
  let s = Be(),
    l = o[V],
    u = Ze(s, o);
  ng(l, o, s, n, null, r);
  for (let g = 0; g < n.length; g++) {
    let h = s.directiveStart + g,
      w = ur(o, l, h, s);
    dr(w, o);
  }
  rg(l, o, s), u && dr(u, o);
  let f = ur(o, l, s.directiveStart + s.componentOffset, s);
  if (((e[Ct] = o[Ct] = f), i !== null)) for (let g of i) g(f, t);
  return Jp(l, s, o), f;
}
function bE(e, t, n, r) {
  if (r) Dc(e, n, ["ng-version", "18.2.13"]);
  else {
    let { attrs: o, classes: i } = Ib(t.selectors[0]);
    o && Dc(e, n, o), i && i.length > 0 && Wp(e, n, i.join(" "));
  }
}
function CE(e, t, n) {
  let r = (e.projection = []);
  for (let o = 0; o < t.length; o++) {
    let i = n[o];
    r.push(i != null ? Array.from(i) : null);
  }
}
function EE() {
  let e = Be();
  fp(fe()[V], e);
}
var _s = (() => {
  class e {
    static {
      this.__NG_ELEMENT_ID__ = IE;
    }
  }
  return e;
})();
function IE() {
  let e = Be();
  return ME(e, fe());
}
var _E = _s,
  gg = class extends _E {
    constructor(t, n, r) {
      super(),
        (this._lContainer = t),
        (this._hostTNode = n),
        (this._hostLView = r);
    }
    get element() {
      return pl(this._hostTNode, this._hostLView);
    }
    get injector() {
      return new vn(this._hostTNode, this._hostLView);
    }
    get parentInjector() {
      let t = ul(this._hostTNode, this._hostLView);
      if (pp(t)) {
        let n = Xi(t, this._hostLView),
          r = Ki(t),
          o = n[V].data[r + 8];
        return new vn(o, n);
      } else return new vn(null, this._hostLView);
    }
    clear() {
      for (; this.length > 0; ) this.remove(this.length - 1);
    }
    get(t) {
      let n = sh(this._lContainer);
      return (n !== null && n[t]) || null;
    }
    get length() {
      return this._lContainer.length - qe;
    }
    createEmbeddedView(t, n, r) {
      let o, i;
      typeof r == "number"
        ? (o = r)
        : r != null && ((o = r.index), (i = r.injector));
      let s = oh(this._lContainer, t.ssrId),
        l = t.createEmbeddedViewImpl(n || {}, i, s);
      return this.insertImpl(l, o, rh(this._hostTNode, s)), l;
    }
    createComponent(t, n, r, o, i) {
      let s = t && !Bb(t),
        l;
      if (s) l = n;
      else {
        let D = n || {};
        (l = D.index),
          (r = D.injector),
          (o = D.projectableNodes),
          (i = D.environmentInjector || D.ngModuleRef);
      }
      let u = s ? t : new mr(zt(t)),
        f = r || this.parentInjector;
      if (!i && u.ngModule == null) {
        let I = (s ? f : this.parentInjector).get(Ne, null);
        I && (i = I);
      }
      let g = zt(u.componentType ?? {}),
        h = oh(this._lContainer, g?.id ?? null),
        w = h?.firstChild ?? null,
        v = u.create(f, o, w, i);
      return this.insertImpl(v.hostView, l, rh(this._hostTNode, h)), v;
    }
    insert(t, n) {
      return this.insertImpl(t, n, !0);
    }
    insertImpl(t, n, r) {
      let o = t._lView;
      if (Wb(o)) {
        let l = this.indexOf(t);
        if (l !== -1) this.detach(l);
        else {
          let u = o[_e],
            f = new gg(u, u[rt], u[_e]);
          f.detach(f.indexOf(t));
        }
      }
      let i = this._adjustIndex(n),
        s = this._lContainer;
      return X0(s, o, i, r), t.attachToViewContainerRef(), Ch(fc(s), i, t), t;
    }
    move(t, n) {
      return this.insert(t, n);
    }
    indexOf(t) {
      let n = sh(this._lContainer);
      return n !== null ? n.indexOf(t) : -1;
    }
    remove(t) {
      let n = this._adjustIndex(t, -1),
        r = Vc(this._lContainer, n);
      r && (zi(fc(this._lContainer), n), $p(r[V], r));
    }
    detach(t) {
      let n = this._adjustIndex(t, -1),
        r = Vc(this._lContainer, n);
      return r && zi(fc(this._lContainer), n) != null ? new fr(r) : null;
    }
    _adjustIndex(t, n = 0) {
      return t ?? this.length + n;
    }
  };
function sh(e) {
  return e[Zi];
}
function fc(e) {
  return e[Zi] || (e[Zi] = []);
}
function ME(e, t) {
  let n,
    r = t[e.index];
  return (
    Mt(r) ? (n = r) : ((n = q0(r, t, null, e)), (t[e.index] = n), _l(t, n)),
    xE(n, t, e, r),
    new gg(n, e, t)
  );
}
function SE(e, t) {
  let n = e[Me],
    r = n.createComment(""),
    o = Ze(t, e),
    i = zp(n, o);
  return rs(n, i, r, l0(n, o), !1), r;
}
var xE = TE;
function TE(e, t, n, r) {
  if (e[wn]) return;
  let o;
  n.type & 8 ? (o = gt(r)) : (o = SE(t, n)), (e[wn] = o);
}
var ah = new Set();
function Dr(e) {
  ah.has(e) ||
    (ah.add(e),
    performance?.mark?.("mark_feature_usage", { detail: { feature: e } }));
}
function lo(e, t) {
  Dr("NgSignals");
  let n = tf(e),
    r = n[Ft];
  return (
    t?.equal && (r.equal = t.equal),
    (n.set = (o) => ja(r, o)),
    (n.update = (o) => nf(r, o)),
    (n.asReadonly = AE.bind(n)),
    n
  );
}
function AE() {
  let e = this[Ft];
  if (e.readonlyFn === void 0) {
    let t = () => this();
    (t[Ft] = e), (e.readonlyFn = t);
  }
  return e.readonlyFn;
}
function NE(e) {
  return Object.getPrototypeOf(e.prototype).constructor;
}
function Jt(e) {
  let t = NE(e.type),
    n = !0,
    r = [e];
  for (; t; ) {
    let o;
    if (Gt(e)) o = t.ɵcmp || t.ɵdir;
    else {
      if (t.ɵcmp) throw new _(903, !1);
      o = t.ɵdir;
    }
    if (o) {
      if (n) {
        r.push(o);
        let s = e;
        (s.inputs = Pi(e.inputs)),
          (s.inputTransforms = Pi(e.inputTransforms)),
          (s.declaredInputs = Pi(e.declaredInputs)),
          (s.outputs = Pi(e.outputs));
        let l = o.hostBindings;
        l && kE(e, l);
        let u = o.viewQuery,
          f = o.contentQueries;
        if (
          (u && PE(e, u),
          f && FE(e, f),
          RE(e, o),
          zD(e.outputs, o.outputs),
          Gt(o) && o.data.animation)
        ) {
          let g = e.data;
          g.animation = (g.animation || []).concat(o.data.animation);
        }
      }
      let i = o.features;
      if (i)
        for (let s = 0; s < i.length; s++) {
          let l = i[s];
          l && l.ngInherit && l(e), l === Jt && (n = !1);
        }
    }
    t = Object.getPrototypeOf(t);
  }
  OE(r);
}
function RE(e, t) {
  for (let n in t.inputs) {
    if (!t.inputs.hasOwnProperty(n) || e.inputs.hasOwnProperty(n)) continue;
    let r = t.inputs[n];
    if (
      r !== void 0 &&
      ((e.inputs[n] = r),
      (e.declaredInputs[n] = t.declaredInputs[n]),
      t.inputTransforms !== null)
    ) {
      let o = Array.isArray(r) ? r[0] : r;
      if (!t.inputTransforms.hasOwnProperty(o)) continue;
      (e.inputTransforms ??= {}), (e.inputTransforms[o] = t.inputTransforms[o]);
    }
  }
}
function OE(e) {
  let t = 0,
    n = null;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e[r];
    (o.hostVars = t += o.hostVars),
      (o.hostAttrs = Kr(o.hostAttrs, (n = Kr(n, o.hostAttrs))));
  }
}
function Pi(e) {
  return e === sr ? {} : e === ze ? [] : e;
}
function PE(e, t) {
  let n = e.viewQuery;
  n
    ? (e.viewQuery = (r, o) => {
        t(r, o), n(r, o);
      })
    : (e.viewQuery = t);
}
function FE(e, t) {
  let n = e.contentQueries;
  n
    ? (e.contentQueries = (r, o, i) => {
        t(r, o, i), n(r, o, i);
      })
    : (e.contentQueries = t);
}
function kE(e, t) {
  let n = e.hostBindings;
  n
    ? (e.hostBindings = (r, o) => {
        t(r, o), n(r, o);
      })
    : (e.hostBindings = t);
}
function xl(e) {
  let t = e.inputConfig,
    n = {};
  for (let r in t)
    if (t.hasOwnProperty(r)) {
      let o = t[r];
      Array.isArray(o) && o[3] && (n[r] = o[3]);
    }
  e.inputTransforms = n;
}
var Wt = class {},
  to = class {};
var Wc = class extends Wt {
    constructor(t, n, r, o = !0) {
      super(),
        (this.ngModuleType = t),
        (this._parent = n),
        (this._bootstrapComponents = []),
        (this.destroyCbs = []),
        (this.componentFactoryResolver = new ss(this));
      let i = Nh(t);
      (this._bootstrapComponents = Vp(i.bootstrap)),
        (this._r3Injector = Ep(
          t,
          n,
          [
            { provide: Wt, useValue: this },
            { provide: pr, useValue: this.componentFactoryResolver },
            ...r,
          ],
          Ae(t),
          new Set(["environment"])
        )),
        o && this.resolveInjectorInitializers();
    }
    resolveInjectorInitializers() {
      this._r3Injector.resolveInjectorInitializers(),
        (this.instance = this._r3Injector.get(this.ngModuleType));
    }
    get injector() {
      return this._r3Injector;
    }
    destroy() {
      let t = this._r3Injector;
      !t.destroyed && t.destroy(),
        this.destroyCbs.forEach((n) => n()),
        (this.destroyCbs = null);
    }
    onDestroy(t) {
      this.destroyCbs.push(t);
    }
  },
  Zc = class extends to {
    constructor(t) {
      super(), (this.moduleType = t);
    }
    create(t) {
      return new Wc(this.moduleType, t, []);
    }
  };
var as = class extends Wt {
  constructor(t) {
    super(),
      (this.componentFactoryResolver = new ss(this)),
      (this.instance = null);
    let n = new Xr(
      [
        ...t.providers,
        { provide: Wt, useValue: this },
        { provide: pr, useValue: this.componentFactoryResolver },
      ],
      t.parent || sl(),
      t.debugName,
      new Set(["environment"])
    );
    (this.injector = n),
      t.runEnvironmentInitializers && n.resolveInjectorInitializers();
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(t) {
    this.injector.onDestroy(t);
  }
};
function Tl(e, t, n = null) {
  return new as({
    providers: e,
    parent: t,
    debugName: n,
    runEnvironmentInitializers: !0,
  }).injector;
}
function LE(e, t, n) {
  return (e[t] = n);
}
function VE(e, t) {
  return e[t];
}
function Al(e, t, n) {
  let r = e[t];
  return Object.is(r, n) ? !1 : ((e[t] = n), !0);
}
function jE(e) {
  return (e.flags & 32) === 32;
}
var Zr = (function (e) {
    return (
      (e[(e.EarlyRead = 0)] = "EarlyRead"),
      (e[(e.Write = 1)] = "Write"),
      (e[(e.MixedReadWrite = 2)] = "MixedReadWrite"),
      (e[(e.Read = 3)] = "Read"),
      e
    );
  })(Zr || {}),
  BE = (() => {
    class e {
      constructor() {
        this.impl = null;
      }
      execute() {
        this.impl?.execute();
      }
      static {
        this.ɵprov = S({
          token: e,
          providedIn: "root",
          factory: () => new e(),
        });
      }
    }
    return e;
  })(),
  ch = class e {
    constructor() {
      (this.ngZone = y(ie)),
        (this.scheduler = y(hr)),
        (this.errorHandler = y(Et, { optional: !0 })),
        (this.sequences = new Set()),
        (this.deferredRegistrations = new Set()),
        (this.executing = !1);
    }
    static {
      this.PHASES = [Zr.EarlyRead, Zr.Write, Zr.MixedReadWrite, Zr.Read];
    }
    execute() {
      this.executing = !0;
      for (let t of e.PHASES)
        for (let n of this.sequences)
          if (!(n.erroredOrDestroyed || !n.hooks[t]))
            try {
              n.pipelinedValue = this.ngZone.runOutsideAngular(() =>
                n.hooks[t](n.pipelinedValue)
              );
            } catch (r) {
              (n.erroredOrDestroyed = !0), this.errorHandler?.handleError(r);
            }
      this.executing = !1;
      for (let t of this.sequences)
        t.afterRun(), t.once && (this.sequences.delete(t), t.destroy());
      for (let t of this.deferredRegistrations) this.sequences.add(t);
      this.deferredRegistrations.size > 0 && this.scheduler.notify(7),
        this.deferredRegistrations.clear();
    }
    register(t) {
      this.executing
        ? this.deferredRegistrations.add(t)
        : (this.sequences.add(t), this.scheduler.notify(6));
    }
    unregister(t) {
      this.executing && this.sequences.has(t)
        ? ((t.erroredOrDestroyed = !0),
          (t.pipelinedValue = void 0),
          (t.once = !0))
        : (this.sequences.delete(t), this.deferredRegistrations.delete(t));
    }
    static {
      this.ɵprov = S({ token: e, providedIn: "root", factory: () => new e() });
    }
  };
function Ms(e, t, n, r) {
  let o = fe(),
    i = tp();
  if (Al(o, i, t)) {
    let s = mt(),
      l = cp();
    $0(l, o, e, t, n, r);
  }
  return Ms;
}
function Fi(e, t) {
  return (e << 17) | (t << 2);
}
function En(e) {
  return (e >> 17) & 32767;
}
function UE(e) {
  return (e & 2) == 2;
}
function $E(e, t) {
  return (e & 131071) | (t << 17);
}
function Yc(e) {
  return e | 2;
}
function vr(e) {
  return (e & 131068) >> 2;
}
function hc(e, t) {
  return (e & -131069) | (t << 2);
}
function HE(e) {
  return (e & 1) === 1;
}
function Qc(e) {
  return e | 1;
}
function zE(e, t, n, r, o, i) {
  let s = i ? t.classBindings : t.styleBindings,
    l = En(s),
    u = vr(s);
  e[r] = n;
  let f = !1,
    g;
  if (Array.isArray(n)) {
    let h = n;
    (g = h[1]), (g === null || ro(h, g) > 0) && (f = !0);
  } else g = n;
  if (o)
    if (u !== 0) {
      let w = En(e[l + 1]);
      (e[r + 1] = Fi(w, l)),
        w !== 0 && (e[w + 1] = hc(e[w + 1], r)),
        (e[l + 1] = $E(e[l + 1], r));
    } else
      (e[r + 1] = Fi(l, 0)), l !== 0 && (e[l + 1] = hc(e[l + 1], r)), (l = r);
  else
    (e[r + 1] = Fi(u, 0)),
      l === 0 ? (l = r) : (e[u + 1] = hc(e[u + 1], r)),
      (u = r);
  f && (e[r + 1] = Yc(e[r + 1])),
    lh(e, g, r, !0),
    lh(e, g, r, !1),
    GE(t, g, e, r, i),
    (s = Fi(l, u)),
    i ? (t.classBindings = s) : (t.styleBindings = s);
}
function GE(e, t, n, r, o) {
  let i = o ? e.residualClasses : e.residualStyles;
  i != null &&
    typeof t == "string" &&
    ro(i, t) >= 0 &&
    (n[r + 1] = Qc(n[r + 1]));
}
function lh(e, t, n, r) {
  let o = e[n + 1],
    i = t === null,
    s = r ? En(o) : vr(o),
    l = !1;
  for (; s !== 0 && (l === !1 || i); ) {
    let u = e[s],
      f = e[s + 1];
    qE(u, t) && ((l = !0), (e[s + 1] = r ? Qc(f) : Yc(f))),
      (s = r ? En(f) : vr(f));
  }
  l && (e[n + 1] = r ? Yc(o) : Qc(o));
}
function qE(e, t) {
  return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t
    ? !0
    : Array.isArray(e) && typeof t == "string"
    ? ro(e, t) >= 0
    : !1;
}
function uo(e, t, n) {
  let r = fe(),
    o = tp();
  if (Al(r, o, t)) {
    let i = mt(),
      s = cp();
    T0(i, s, r, e, t, r[Me], n, !1);
  }
  return uo;
}
function uh(e, t, n, r, o) {
  let i = t.inputs,
    s = o ? "class" : "style";
  Ml(e, n, i[s], s, r);
}
function Ss(e, t) {
  return WE(e, t, null, !0), Ss;
}
function WE(e, t, n, r) {
  let o = fe(),
    i = mt(),
    s = iC(2);
  if ((i.firstUpdatePass && YE(i, e, s, r), t !== co && Al(o, s, t))) {
    let l = i.data[io()];
    eI(i, l, o, o[Me], e, (o[s + 1] = tI(t, n)), r, s);
  }
}
function ZE(e, t) {
  return t >= e.expandoStartIndex;
}
function YE(e, t, n, r) {
  let o = e.data;
  if (o[n + 1] === null) {
    let i = o[io()],
      s = ZE(e, n);
    nI(i, r) && t === null && !s && (t = !1),
      (t = QE(o, i, t, r)),
      zE(o, i, t, n, s, r);
  }
}
function QE(e, t, n, r) {
  let o = lC(e),
    i = r ? t.residualClasses : t.residualStyles;
  if (o === null)
    (r ? t.classBindings : t.styleBindings) === 0 &&
      ((n = pc(null, e, t, n, r)), (n = no(n, t.attrs, r)), (i = null));
  else {
    let s = t.directiveStylingLast;
    if (s === -1 || e[s] !== o)
      if (((n = pc(o, e, t, n, r)), i === null)) {
        let u = KE(e, t, r);
        u !== void 0 &&
          Array.isArray(u) &&
          ((u = pc(null, e, t, u[1], r)),
          (u = no(u, t.attrs, r)),
          XE(e, t, r, u));
      } else i = JE(e, t, r);
  }
  return (
    i !== void 0 && (r ? (t.residualClasses = i) : (t.residualStyles = i)), n
  );
}
function KE(e, t, n) {
  let r = n ? t.classBindings : t.styleBindings;
  if (vr(r) !== 0) return e[En(r)];
}
function XE(e, t, n, r) {
  let o = n ? t.classBindings : t.styleBindings;
  e[En(o)] = r;
}
function JE(e, t, n) {
  let r,
    o = t.directiveEnd;
  for (let i = 1 + t.directiveStylingLast; i < o; i++) {
    let s = e[i].hostAttrs;
    r = no(r, s, n);
  }
  return no(r, t.attrs, n);
}
function pc(e, t, n, r, o) {
  let i = null,
    s = n.directiveEnd,
    l = n.directiveStylingLast;
  for (
    l === -1 ? (l = n.directiveStart) : l++;
    l < s && ((i = t[l]), (r = no(r, i.hostAttrs, o)), i !== e);

  )
    l++;
  return e !== null && (n.directiveStylingLast = l), r;
}
function no(e, t, n) {
  let r = n ? 1 : 2,
    o = -1;
  if (t !== null)
    for (let i = 0; i < t.length; i++) {
      let s = t[i];
      typeof s == "number"
        ? (o = s)
        : o === r &&
          (Array.isArray(e) || (e = e === void 0 ? [] : ["", e]),
          db(e, s, n ? !0 : t[++i]));
    }
  return e === void 0 ? null : e;
}
function eI(e, t, n, r, o, i, s, l) {
  if (!(t.type & 3)) return;
  let u = e.data,
    f = u[l + 1],
    g = HE(f) ? dh(u, t, n, o, vr(f), s) : void 0;
  if (!cs(g)) {
    cs(i) || (UE(f) && (i = dh(u, null, n, o, l, s)));
    let h = qb(io(), n);
    m0(r, s, h, o, i);
  }
}
function dh(e, t, n, r, o, i) {
  let s = t === null,
    l;
  for (; o > 0; ) {
    let u = e[o],
      f = Array.isArray(u),
      g = f ? u[1] : u,
      h = g === null,
      w = n[o + 1];
    w === co && (w = h ? ze : void 0);
    let v = h ? oc(w, r) : g === r ? w : void 0;
    if ((f && !cs(v) && (v = oc(u, r)), cs(v) && ((l = v), s))) return l;
    let D = e[o + 1];
    o = s ? En(D) : vr(D);
  }
  if (t !== null) {
    let u = i ? t.residualClasses : t.residualStyles;
    u != null && (l = oc(u, r));
  }
  return l;
}
function cs(e) {
  return e !== void 0;
}
function tI(e, t) {
  return (
    e == null ||
      e === "" ||
      (typeof t == "string"
        ? (e = e + t)
        : typeof e == "object" && (e = Ae(ao(e)))),
    e
  );
}
function nI(e, t) {
  return (e.flags & (t ? 8 : 16)) !== 0;
}
function rI(e, t, n, r, o, i) {
  let s = t.consts,
    l = Uf(s, o),
    u = Il(t, e, 2, r, l);
  return (
    N0(t, n, u, Uf(s, i)),
    u.attrs !== null && Gc(u, u.attrs, !1),
    u.mergedAttrs !== null && Gc(u, u.mergedAttrs, !0),
    t.queries !== null && t.queries.elementStart(t, u),
    u
  );
}
function Q(e, t, n, r) {
  let o = fe(),
    i = mt(),
    s = yn + e,
    l = o[Me],
    u = i.firstCreatePass ? rI(s, i, o, t, n, r) : i.data[s],
    f = oI(i, o, u, l, t, e);
  o[s] = f;
  let g = Uh(u);
  return (
    Ds(u, !0),
    Zp(l, f, u),
    !jE(u) && up() && Gp(i, o, f, u),
    Yb() === 0 && dr(f, o),
    Qb(),
    g && (D0(i, o, u), Jp(i, u, o)),
    r !== null && b0(o, u),
    Q
  );
}
function te() {
  let e = Be();
  Jh() ? nC() : ((e = e.parent), Ds(e, !1));
  let t = e;
  Jb(t) && eC(), Kb();
  let n = mt();
  return (
    n.firstCreatePass && (fp(n, e), Bh(e) && n.queries.elementEnd(e)),
    t.classesWithoutHost != null &&
      gC(t) &&
      uh(n, t, fe(), t.classesWithoutHost, !0),
    t.stylesWithoutHost != null &&
      mC(t) &&
      uh(n, t, fe(), t.stylesWithoutHost, !1),
    te
  );
}
function J(e, t, n, r) {
  return Q(e, t, n, r), te(), J;
}
var oI = (e, t, n, r, o, i) => (dp(!0), jp(r, o, dC()));
var ls = "en-US";
var iI = ls;
function sI(e) {
  typeof e == "string" && (iI = e.toLowerCase().replace(/_/g, "-"));
}
var aI = (e, t, n) => {};
function vt(e, t, n, r) {
  let o = fe(),
    i = mt(),
    s = Be();
  return lI(i, o, o[Me], s, e, t, r), vt;
}
function cI(e, t, n, r) {
  let o = e.cleanup;
  if (o != null)
    for (let i = 0; i < o.length - 1; i += 2) {
      let s = o[i];
      if (s === n && o[i + 1] === r) {
        let l = t[Wi],
          u = o[i + 2];
        return l.length > u ? l[u] : null;
      }
      typeof s == "string" && (i += 2);
    }
  return null;
}
function lI(e, t, n, r, o, i, s) {
  let l = Uh(r),
    f = e.firstCreatePass && Z0(e),
    g = t[Ct],
    h = W0(t),
    w = !0;
  if (r.type & 3 || s) {
    let I = Ze(r, t),
      E = s ? s(I) : I,
      x = h.length,
      ee = s ? (ce) => s(gt(ce[r.index])) : r.index,
      j = null;
    if ((!s && l && (j = cI(e, t, o, r.index)), j !== null)) {
      let ce = j.__ngLastListenerFn__ || j;
      (ce.__ngNextListenerFn__ = i), (j.__ngLastListenerFn__ = i), (w = !1);
    } else {
      (i = hh(r, t, g, i)), aI(I, o, i);
      let ce = n.listen(E, o, i);
      h.push(i, ce), f && f.push(o, ee, x, x + 1);
    }
  } else i = hh(r, t, g, i);
  let v = r.outputs,
    D;
  if (w && v !== null && (D = v[o])) {
    let I = D.length;
    if (I)
      for (let E = 0; E < I; E += 2) {
        let x = D[E],
          ee = D[E + 1],
          he = t[x][ee].subscribe(i),
          ne = h.length;
        h.push(i, he), f && f.push(o, r.index, ne, -(ne + 1));
      }
  }
}
function fh(e, t, n, r) {
  let o = W(null);
  try {
    return ut(6, t, n), n(r) !== !1;
  } catch (i) {
    return ig(e, i), !1;
  } finally {
    ut(7, t, n), W(o);
  }
}
function hh(e, t, n, r) {
  return function o(i) {
    if (i === Function) return r;
    let s = e.componentOffset > -1 ? Yt(e.index, t) : t;
    Sl(s, 5);
    let l = fh(t, n, r, i),
      u = o.__ngNextListenerFn__;
    for (; u; ) (l = fh(t, n, u, i) && l), (u = u.__ngNextListenerFn__);
    return l;
  };
}
function ot(e, t = "") {
  let n = fe(),
    r = mt(),
    o = e + yn,
    i = r.firstCreatePass ? Il(r, o, 1, t, null) : r.data[o],
    s = uI(r, n, i, t, e);
  (n[o] = s), up() && Gp(r, n, s, i), Ds(i, !1);
}
var uI = (e, t, n, r, o) => (dp(!0), e0(t[Me], r));
function dI(e, t, n) {
  let r = mt();
  if (r.firstCreatePass) {
    let o = Gt(e);
    Kc(n, r.data, r.blueprint, o, !0), Kc(t, r.data, r.blueprint, o, !1);
  }
}
function Kc(e, t, n, r, o) {
  if (((e = Ie(e)), Array.isArray(e)))
    for (let i = 0; i < e.length; i++) Kc(e[i], t, n, r, o);
  else {
    let i = mt(),
      s = fe(),
      l = Be(),
      u = cr(e) ? e : Ie(e.provide),
      f = Lh(e),
      g = l.providerIndexes & 1048575,
      h = l.directiveStart,
      w = l.providerIndexes >> 20;
    if (cr(e) || !e.multi) {
      let v = new Cn(f, o, X),
        D = mc(u, t, o ? g : g + w, h);
      D === -1
        ? (Ac(Ji(l, s), i, u),
          gc(i, e, t.length),
          t.push(u),
          l.directiveStart++,
          l.directiveEnd++,
          o && (l.providerIndexes += 1048576),
          n.push(v),
          s.push(v))
        : ((n[D] = v), (s[D] = v));
    } else {
      let v = mc(u, t, g + w, h),
        D = mc(u, t, g, g + w),
        I = v >= 0 && n[v],
        E = D >= 0 && n[D];
      if ((o && !E) || (!o && !I)) {
        Ac(Ji(l, s), i, u);
        let x = pI(o ? hI : fI, n.length, o, r, f);
        !o && E && (n[D].providerFactory = x),
          gc(i, e, t.length, 0),
          t.push(u),
          l.directiveStart++,
          l.directiveEnd++,
          o && (l.providerIndexes += 1048576),
          n.push(x),
          s.push(x);
      } else {
        let x = mg(n[o ? D : v], f, !o && r);
        gc(i, e, v > -1 ? v : D, x);
      }
      !o && r && E && n[D].componentProviders++;
    }
  }
}
function gc(e, t, n, r) {
  let o = cr(t),
    i = Rb(t);
  if (o || i) {
    let u = (i ? Ie(t.useClass) : t).prototype.ngOnDestroy;
    if (u) {
      let f = e.destroyHooks || (e.destroyHooks = []);
      if (!o && t.multi) {
        let g = f.indexOf(n);
        g === -1 ? f.push(n, [r, u]) : f[g + 1].push(r, u);
      } else f.push(n, u);
    }
  }
}
function mg(e, t, n) {
  return n && e.componentProviders++, e.multi.push(t) - 1;
}
function mc(e, t, n, r) {
  for (let o = n; o < r; o++) if (t[o] === e) return o;
  return -1;
}
function fI(e, t, n, r) {
  return Xc(this.multi, []);
}
function hI(e, t, n, r) {
  let o = this.multi,
    i;
  if (this.providerFactory) {
    let s = this.providerFactory.componentProviders,
      l = ur(n, n[V], this.providerFactory.index, r);
    (i = l.slice(0, s)), Xc(o, i);
    for (let u = s; u < l.length; u++) i.push(l[u]);
  } else (i = []), Xc(o, i);
  return i;
}
function Xc(e, t) {
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    t.push(r());
  }
  return t;
}
function pI(e, t, n, r, o) {
  let i = new Cn(e, n, X);
  return (
    (i.multi = []),
    (i.index = t),
    (i.componentProviders = 0),
    mg(i, o, r && !n),
    i
  );
}
function xs(e, t = []) {
  return (n) => {
    n.providersResolver = (r, o) => dI(r, o ? o(e) : e, t);
  };
}
var gI = (() => {
  class e {
    constructor(n) {
      (this._injector = n), (this.cachedInjectors = new Map());
    }
    getOrCreateStandaloneInjector(n) {
      if (!n.standalone) return null;
      if (!this.cachedInjectors.has(n)) {
        let r = Ph(!1, n.type),
          o =
            r.length > 0
              ? Tl([r], this._injector, `Standalone[${n.type.name}]`)
              : null;
        this.cachedInjectors.set(n, o);
      }
      return this.cachedInjectors.get(n);
    }
    ngOnDestroy() {
      try {
        for (let n of this.cachedInjectors.values()) n !== null && n.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
    static {
      this.ɵprov = S({
        token: e,
        providedIn: "environment",
        factory: () => new e(R(Ne)),
      });
    }
  }
  return e;
})();
function Ye(e) {
  Dr("NgStandalone"),
    (e.getStandaloneInjector = (t) =>
      t.get(gI).getOrCreateStandaloneInjector(e));
}
function vg(e, t, n) {
  let r = rC() + e,
    o = fe();
  return o[r] === co ? LE(o, r, n ? t.call(n) : t()) : VE(o, r);
}
var Ts = (() => {
  class e {
    log(n) {
      console.log(n);
    }
    warn(n) {
      console.warn(n);
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "platform" });
    }
  }
  return e;
})();
var yg = new M("");
function Sn(e) {
  return !!e && typeof e.then == "function";
}
function wg(e) {
  return !!e && typeof e.subscribe == "function";
}
var Dg = new M(""),
  bg = (() => {
    class e {
      constructor() {
        (this.initialized = !1),
          (this.done = !1),
          (this.donePromise = new Promise((n, r) => {
            (this.resolve = n), (this.reject = r);
          })),
          (this.appInits = y(Dg, { optional: !0 }) ?? []);
      }
      runInitializers() {
        if (this.initialized) return;
        let n = [];
        for (let o of this.appInits) {
          let i = o();
          if (Sn(i)) n.push(i);
          else if (wg(i)) {
            let s = new Promise((l, u) => {
              i.subscribe({ complete: l, error: u });
            });
            n.push(s);
          }
        }
        let r = () => {
          (this.done = !0), this.resolve();
        };
        Promise.all(n)
          .then(() => {
            r();
          })
          .catch((o) => {
            this.reject(o);
          }),
          n.length === 0 && r(),
          (this.initialized = !0);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  As = new M("");
function mI() {
  ef(() => {
    throw new _(600, !1);
  });
}
function vI(e) {
  return e.isBoundToModule;
}
var yI = 10;
function wI(e, t, n) {
  try {
    let r = n();
    return Sn(r)
      ? r.catch((o) => {
          throw (t.runOutsideAngular(() => e.handleError(o)), o);
        })
      : r;
  } catch (r) {
    throw (t.runOutsideAngular(() => e.handleError(r)), r);
  }
}
var en = (() => {
  class e {
    constructor() {
      (this._bootstrapListeners = []),
        (this._runningTick = !1),
        (this._destroyed = !1),
        (this._destroyListeners = []),
        (this._views = []),
        (this.internalErrorHandler = y(kC)),
        (this.afterRenderManager = y(BE)),
        (this.zonelessEnabled = y(Is)),
        (this.dirtyFlags = 0),
        (this.deferredDirtyFlags = 0),
        (this.externalTestViews = new Set()),
        (this.beforeRender = new ve()),
        (this.afterTick = new ve()),
        (this.componentTypes = []),
        (this.components = []),
        (this.isStable = y(Qt).hasPendingTasks.pipe(O((n) => !n))),
        (this._injector = y(Ne));
    }
    get allViews() {
      return [...this.externalTestViews.keys(), ...this._views];
    }
    get destroyed() {
      return this._destroyed;
    }
    whenStable() {
      let n;
      return new Promise((r) => {
        n = this.isStable.subscribe({
          next: (o) => {
            o && r();
          },
        });
      }).finally(() => {
        n.unsubscribe();
      });
    }
    get injector() {
      return this._injector;
    }
    bootstrap(n, r) {
      let o = n instanceof is;
      if (!this._injector.get(bg).done) {
        let w = !o && Ah(n),
          v = !1;
        throw new _(405, v);
      }
      let s;
      o ? (s = n) : (s = this._injector.get(pr).resolveComponentFactory(n)),
        this.componentTypes.push(s.componentType);
      let l = vI(s) ? void 0 : this._injector.get(Wt),
        u = r || s.selector,
        f = s.create(qt.NULL, [], u, l),
        g = f.location.nativeElement,
        h = f.injector.get(yg, null);
      return (
        h?.registerApplication(g),
        f.onDestroy(() => {
          this.detachView(f.hostView),
            Bi(this.components, f),
            h?.unregisterApplication(g);
        }),
        this._loadComponent(f),
        f
      );
    }
    tick() {
      this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick();
    }
    _tick() {
      if (this._runningTick) throw new _(101, !1);
      let n = W(null);
      try {
        (this._runningTick = !0), this.synchronize();
      } catch (r) {
        this.internalErrorHandler(r);
      } finally {
        (this._runningTick = !1), W(n), this.afterTick.next();
      }
    }
    synchronize() {
      let n = null;
      this._injector.destroyed ||
        (n = this._injector.get(gr, null, { optional: !0 })),
        (this.dirtyFlags |= this.deferredDirtyFlags),
        (this.deferredDirtyFlags = 0);
      let r = 0;
      for (; this.dirtyFlags !== 0 && r++ < yI; ) this.synchronizeOnce(n);
    }
    synchronizeOnce(n) {
      if (
        ((this.dirtyFlags |= this.deferredDirtyFlags),
        (this.deferredDirtyFlags = 0),
        this.dirtyFlags & 7)
      ) {
        let r = !!(this.dirtyFlags & 1);
        (this.dirtyFlags &= -8),
          (this.dirtyFlags |= 8),
          this.beforeRender.next(r);
        for (let { _lView: o, notifyErrorHandler: i } of this._views)
          DI(o, i, r, this.zonelessEnabled);
        if (
          ((this.dirtyFlags &= -5),
          this.syncDirtyFlagsWithViews(),
          this.dirtyFlags & 7)
        )
          return;
      } else n?.begin?.(), n?.end?.();
      this.dirtyFlags & 8 &&
        ((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
        this.syncDirtyFlagsWithViews();
    }
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({ _lView: n }) => ys(n))) {
        this.dirtyFlags |= 2;
        return;
      } else this.dirtyFlags &= -8;
    }
    attachView(n) {
      let r = n;
      this._views.push(r), r.attachToAppRef(this);
    }
    detachView(n) {
      let r = n;
      Bi(this._views, r), r.detachFromAppRef();
    }
    _loadComponent(n) {
      this.attachView(n.hostView), this.tick(), this.components.push(n);
      let r = this._injector.get(As, []);
      [...this._bootstrapListeners, ...r].forEach((o) => o(n));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          this._destroyListeners.forEach((n) => n()),
            this._views.slice().forEach((n) => n.destroy());
        } finally {
          (this._destroyed = !0),
            (this._views = []),
            (this._bootstrapListeners = []),
            (this._destroyListeners = []);
        }
    }
    onDestroy(n) {
      return (
        this._destroyListeners.push(n), () => Bi(this._destroyListeners, n)
      );
    }
    destroy() {
      if (this._destroyed) throw new _(406, !1);
      let n = this._injector;
      n.destroy && !n.destroyed && n.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    warnIfDestroyed() {}
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
    }
  }
  return e;
})();
function Bi(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
function DI(e, t, n, r) {
  if (!n && !ys(e)) return;
  lg(e, t, n && !r ? 0 : 1);
}
var Jc = class {
    constructor(t, n) {
      (this.ngModuleFactory = t), (this.componentFactories = n);
    }
  },
  Nl = (() => {
    class e {
      compileModuleSync(n) {
        return new Zc(n);
      }
      compileModuleAsync(n) {
        return Promise.resolve(this.compileModuleSync(n));
      }
      compileModuleAndAllComponentsSync(n) {
        let r = this.compileModuleSync(n),
          o = Nh(n),
          i = Vp(o.declarations).reduce((s, l) => {
            let u = zt(l);
            return u && s.push(new mr(u)), s;
          }, []);
        return new Jc(r, i);
      }
      compileModuleAndAllComponentsAsync(n) {
        return Promise.resolve(this.compileModuleAndAllComponentsSync(n));
      }
      clearCache() {}
      clearCacheFor(n) {}
      getModuleId(n) {}
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })();
var bI = (() => {
    class e {
      constructor() {
        (this.zone = y(ie)),
          (this.changeDetectionScheduler = y(hr)),
          (this.applicationRef = y(en));
      }
      initialize() {
        this._onMicrotaskEmptySubscription ||
          (this._onMicrotaskEmptySubscription =
            this.zone.onMicrotaskEmpty.subscribe({
              next: () => {
                this.changeDetectionScheduler.runningTick ||
                  this.zone.run(() => {
                    this.applicationRef.tick();
                  });
              },
            }));
      }
      ngOnDestroy() {
        this._onMicrotaskEmptySubscription?.unsubscribe();
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  CI = new M("", { factory: () => !1 });
function Cg({
  ngZoneFactory: e,
  ignoreChangesOutsideZone: t,
  scheduleInRootZone: n,
}) {
  return (
    (e ??= () => new ie(U(b({}, Ig()), { scheduleInRootZone: n }))),
    [
      { provide: ie, useFactory: e },
      {
        provide: ar,
        multi: !0,
        useFactory: () => {
          let r = y(bI, { optional: !0 });
          return () => r.initialize();
        },
      },
      {
        provide: ar,
        multi: !0,
        useFactory: () => {
          let r = y(EI);
          return () => {
            r.initialize();
          };
        },
      },
      t === !0 ? { provide: hg, useValue: !0 } : [],
      { provide: pg, useValue: n ?? Ip },
    ]
  );
}
function Eg(e) {
  let t = e?.ignoreChangesOutsideZone,
    n = e?.scheduleInRootZone,
    r = Cg({
      ngZoneFactory: () => {
        let o = Ig(e);
        return (
          (o.scheduleInRootZone = n),
          o.shouldCoalesceEventChangeDetection && Dr("NgZone_CoalesceEvent"),
          new ie(o)
        );
      },
      ignoreChangesOutsideZone: t,
      scheduleInRootZone: n,
    });
  return wr([{ provide: CI, useValue: !0 }, { provide: Is, useValue: !1 }, r]);
}
function Ig(e) {
  return {
    enableLongStackTrace: !1,
    shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1,
    shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1,
  };
}
var EI = (() => {
  class e {
    constructor() {
      (this.subscription = new le()),
        (this.initialized = !1),
        (this.zone = y(ie)),
        (this.pendingTasks = y(Qt));
    }
    initialize() {
      if (this.initialized) return;
      this.initialized = !0;
      let n = null;
      !this.zone.isStable &&
        !this.zone.hasPendingMacrotasks &&
        !this.zone.hasPendingMicrotasks &&
        (n = this.pendingTasks.add()),
        this.zone.runOutsideAngular(() => {
          this.subscription.add(
            this.zone.onStable.subscribe(() => {
              ie.assertNotInAngularZone(),
                queueMicrotask(() => {
                  n !== null &&
                    !this.zone.hasPendingMacrotasks &&
                    !this.zone.hasPendingMicrotasks &&
                    (this.pendingTasks.remove(n), (n = null));
                });
            })
          );
        }),
        this.subscription.add(
          this.zone.onUnstable.subscribe(() => {
            ie.assertInAngularZone(), (n ??= this.pendingTasks.add());
          })
        );
    }
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
    }
  }
  return e;
})();
var II = (() => {
  class e {
    constructor() {
      (this.appRef = y(en)),
        (this.taskService = y(Qt)),
        (this.ngZone = y(ie)),
        (this.zonelessEnabled = y(Is)),
        (this.disableScheduling = y(hg, { optional: !0 }) ?? !1),
        (this.zoneIsDefined = typeof Zone < "u" && !!Zone.root.run),
        (this.schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }]),
        (this.subscriptions = new le()),
        (this.angularZoneId = this.zoneIsDefined
          ? this.ngZone._inner?.get(ts)
          : null),
        (this.scheduleInRootZone =
          !this.zonelessEnabled &&
          this.zoneIsDefined &&
          (y(pg, { optional: !0 }) ?? !1)),
        (this.cancelScheduledCallback = null),
        (this.useMicrotaskScheduler = !1),
        (this.runningTick = !1),
        (this.pendingRenderTaskId = null),
        this.subscriptions.add(
          this.appRef.afterTick.subscribe(() => {
            this.runningTick || this.cleanup();
          })
        ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          })
        ),
        (this.disableScheduling ||=
          !this.zonelessEnabled &&
          (this.ngZone instanceof Fc || !this.zoneIsDefined));
    }
    notify(n) {
      if (!this.zonelessEnabled && n === 5) return;
      switch (n) {
        case 0: {
          this.appRef.dirtyFlags |= 2;
          break;
        }
        case 3:
        case 2:
        case 4:
        case 5:
        case 1: {
          this.appRef.dirtyFlags |= 4;
          break;
        }
        case 7: {
          this.appRef.deferredDirtyFlags |= 8;
          break;
        }
        case 9:
        case 8:
        case 6:
        case 10:
        default:
          this.appRef.dirtyFlags |= 8;
      }
      if (!this.shouldScheduleTick()) return;
      let r = this.useMicrotaskScheduler ? Zf : Mp;
      (this.pendingRenderTaskId = this.taskService.add()),
        this.scheduleInRootZone
          ? (this.cancelScheduledCallback = Zone.root.run(() =>
              r(() => this.tick())
            ))
          : (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() =>
              r(() => this.tick())
            ));
    }
    shouldScheduleTick() {
      return !(
        this.disableScheduling ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled &&
          this.zoneIsDefined &&
          Zone.current.get(ts + this.angularZoneId))
      );
    }
    tick() {
      if (this.runningTick || this.appRef.destroyed) return;
      !this.zonelessEnabled &&
        this.appRef.dirtyFlags & 7 &&
        (this.appRef.dirtyFlags |= 1);
      let n = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            (this.runningTick = !0), this.appRef._tick();
          },
          void 0,
          this.schedulerTickApplyArgs
        );
      } catch (r) {
        throw (this.taskService.remove(n), r);
      } finally {
        this.cleanup();
      }
      (this.useMicrotaskScheduler = !0),
        Zf(() => {
          (this.useMicrotaskScheduler = !1), this.taskService.remove(n);
        });
    }
    ngOnDestroy() {
      this.subscriptions.unsubscribe(), this.cleanup();
    }
    cleanup() {
      if (
        ((this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let n = this.pendingRenderTaskId;
        (this.pendingRenderTaskId = null), this.taskService.remove(n);
      }
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
    }
  }
  return e;
})();
function _I() {
  return (typeof $localize < "u" && $localize.locale) || ls;
}
var Rl = new M("", {
  providedIn: "root",
  factory: () => y(Rl, k.Optional | k.SkipSelf) || _I(),
});
var el = new M("");
function ki(e) {
  return !e.moduleRef;
}
function MI(e) {
  let t = ki(e) ? e.r3Injector : e.moduleRef.injector,
    n = t.get(ie);
  return n.run(() => {
    ki(e)
      ? e.r3Injector.resolveInjectorInitializers()
      : e.moduleRef.resolveInjectorInitializers();
    let r = t.get(Et, null),
      o;
    if (
      (n.runOutsideAngular(() => {
        o = n.onError.subscribe({
          next: (i) => {
            r.handleError(i);
          },
        });
      }),
      ki(e))
    ) {
      let i = () => t.destroy(),
        s = e.platformInjector.get(el);
      s.add(i),
        t.onDestroy(() => {
          o.unsubscribe(), s.delete(i);
        });
    } else {
      let i = () => e.moduleRef.destroy(),
        s = e.platformInjector.get(el);
      s.add(i),
        e.moduleRef.onDestroy(() => {
          Bi(e.allPlatformModules, e.moduleRef), o.unsubscribe(), s.delete(i);
        });
    }
    return wI(r, n, () => {
      let i = t.get(bg);
      return (
        i.runInitializers(),
        i.donePromise.then(() => {
          let s = t.get(Rl, ls);
          if ((sI(s || ls), ki(e))) {
            let l = t.get(en);
            return (
              e.rootComponent !== void 0 && l.bootstrap(e.rootComponent), l
            );
          } else return SI(e.moduleRef, e.allPlatformModules), e.moduleRef;
        })
      );
    });
  });
}
function SI(e, t) {
  let n = e.injector.get(en);
  if (e._bootstrapComponents.length > 0)
    e._bootstrapComponents.forEach((r) => n.bootstrap(r));
  else if (e.instance.ngDoBootstrap) e.instance.ngDoBootstrap(n);
  else throw new _(-403, !1);
  t.push(e);
}
var Ui = null;
function xI(e = [], t) {
  return qt.create({
    name: t,
    providers: [
      { provide: ps, useValue: "platform" },
      { provide: el, useValue: new Set([() => (Ui = null)]) },
      ...e,
    ],
  });
}
function TI(e = []) {
  if (Ui) return Ui;
  let t = xI(e);
  return (Ui = t), mI(), AI(t), t;
}
function AI(e) {
  e.get(ml, null)?.forEach((n) => n());
}
var br = (() => {
  class e {
    static {
      this.__NG_ELEMENT_ID__ = NI;
    }
  }
  return e;
})();
function NI(e) {
  return RI(Be(), fe(), (e & 16) === 16);
}
function RI(e, t, n) {
  if (vs(e) && !n) {
    let r = Yt(e.index, t);
    return new fr(r, r);
  } else if (e.type & 175) {
    let r = t[pt];
    return new fr(r, t);
  }
  return null;
}
function _g(e) {
  try {
    let { rootComponent: t, appProviders: n, platformProviders: r } = e,
      o = TI(r),
      i = [Cg({}), { provide: hr, useExisting: II }, ...(n || [])],
      s = new as({
        providers: i,
        parent: o,
        debugName: "",
        runEnvironmentInitializers: !1,
      });
    return MI({
      r3Injector: s.injector,
      platformInjector: o,
      rootComponent: t,
    });
  } catch (t) {
    return Promise.reject(t);
  }
}
function Cr(e) {
  return typeof e == "boolean" ? e : e != null && e !== "false";
}
function fo(e, t) {
  Dr("NgSignals");
  let n = Kd(e);
  return t?.equal && (n[Ft].equal = t.equal), n;
}
function St(e) {
  let t = W(null);
  try {
    return e();
  } finally {
    W(t);
  }
}
function Mg(e) {
  let t = zt(e);
  if (!t) return null;
  let n = new mr(t);
  return {
    get selector() {
      return n.selector;
    },
    get type() {
      return n.componentType;
    },
    get inputs() {
      return n.inputs;
    },
    get outputs() {
      return n.outputs;
    },
    get ngContentSelectors() {
      return n.ngContentSelectors;
    },
    get isStandalone() {
      return t.standalone;
    },
    get isSignal() {
      return t.signals;
    },
  };
}
var Tg = null;
function xt() {
  return Tg;
}
function Ag(e) {
  Tg ??= e;
}
var Ns = class {};
var Re = new M(""),
  Ng = (() => {
    class e {
      historyGo(n) {
        throw new Error("");
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({
          token: e,
          factory: () => y(PI),
          providedIn: "platform",
        });
      }
    }
    return e;
  })();
var PI = (() => {
  class e extends Ng {
    constructor() {
      super(),
        (this._doc = y(Re)),
        (this._location = window.location),
        (this._history = window.history);
    }
    getBaseHrefFromDOM() {
      return xt().getBaseHref(this._doc);
    }
    onPopState(n) {
      let r = xt().getGlobalEventTarget(this._doc, "window");
      return (
        r.addEventListener("popstate", n, !1),
        () => r.removeEventListener("popstate", n)
      );
    }
    onHashChange(n) {
      let r = xt().getGlobalEventTarget(this._doc, "window");
      return (
        r.addEventListener("hashchange", n, !1),
        () => r.removeEventListener("hashchange", n)
      );
    }
    get href() {
      return this._location.href;
    }
    get protocol() {
      return this._location.protocol;
    }
    get hostname() {
      return this._location.hostname;
    }
    get port() {
      return this._location.port;
    }
    get pathname() {
      return this._location.pathname;
    }
    get search() {
      return this._location.search;
    }
    get hash() {
      return this._location.hash;
    }
    set pathname(n) {
      this._location.pathname = n;
    }
    pushState(n, r, o) {
      this._history.pushState(n, r, o);
    }
    replaceState(n, r, o) {
      this._history.replaceState(n, r, o);
    }
    forward() {
      this._history.forward();
    }
    back() {
      this._history.back();
    }
    historyGo(n = 0) {
      this._history.go(n);
    }
    getState() {
      return this._history.state;
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({
        token: e,
        factory: () => new e(),
        providedIn: "platform",
      });
    }
  }
  return e;
})();
function Rg(e, t) {
  if (e.length == 0) return t;
  if (t.length == 0) return e;
  let n = 0;
  return (
    e.endsWith("/") && n++,
    t.startsWith("/") && n++,
    n == 2 ? e + t.substring(1) : n == 1 ? e + t : e + "/" + t
  );
}
function Sg(e) {
  let t = e.match(/#|\?|$/),
    n = (t && t.index) || e.length,
    r = n - (e[n - 1] === "/" ? 1 : 0);
  return e.slice(0, r) + e.slice(n);
}
function xn(e) {
  return e && e[0] !== "?" ? "?" + e : e;
}
var Ir = (() => {
    class e {
      historyGo(n) {
        throw new Error("");
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: () => y(Og), providedIn: "root" });
      }
    }
    return e;
  })(),
  FI = new M(""),
  Og = (() => {
    class e extends Ir {
      constructor(n, r) {
        super(),
          (this._platformLocation = n),
          (this._removeListenerFns = []),
          (this._baseHref =
            r ??
            this._platformLocation.getBaseHrefFromDOM() ??
            y(Re).location?.origin ??
            "");
      }
      ngOnDestroy() {
        for (; this._removeListenerFns.length; )
          this._removeListenerFns.pop()();
      }
      onPopState(n) {
        this._removeListenerFns.push(
          this._platformLocation.onPopState(n),
          this._platformLocation.onHashChange(n)
        );
      }
      getBaseHref() {
        return this._baseHref;
      }
      prepareExternalUrl(n) {
        return Rg(this._baseHref, n);
      }
      path(n = !1) {
        let r =
            this._platformLocation.pathname + xn(this._platformLocation.search),
          o = this._platformLocation.hash;
        return o && n ? `${r}${o}` : r;
      }
      pushState(n, r, o, i) {
        let s = this.prepareExternalUrl(o + xn(i));
        this._platformLocation.pushState(n, r, s);
      }
      replaceState(n, r, o, i) {
        let s = this.prepareExternalUrl(o + xn(i));
        this._platformLocation.replaceState(n, r, s);
      }
      forward() {
        this._platformLocation.forward();
      }
      back() {
        this._platformLocation.back();
      }
      getState() {
        return this._platformLocation.getState();
      }
      historyGo(n = 0) {
        this._platformLocation.historyGo?.(n);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Ng), R(FI, 8));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })();
var ho = (() => {
  class e {
    constructor(n) {
      (this._subject = new de()),
        (this._urlChangeListeners = []),
        (this._urlChangeSubscription = null),
        (this._locationStrategy = n);
      let r = this._locationStrategy.getBaseHref();
      (this._basePath = VI(Sg(xg(r)))),
        this._locationStrategy.onPopState((o) => {
          this._subject.emit({
            url: this.path(!0),
            pop: !0,
            state: o.state,
            type: o.type,
          });
        });
    }
    ngOnDestroy() {
      this._urlChangeSubscription?.unsubscribe(),
        (this._urlChangeListeners = []);
    }
    path(n = !1) {
      return this.normalize(this._locationStrategy.path(n));
    }
    getState() {
      return this._locationStrategy.getState();
    }
    isCurrentPathEqualTo(n, r = "") {
      return this.path() == this.normalize(n + xn(r));
    }
    normalize(n) {
      return e.stripTrailingSlash(LI(this._basePath, xg(n)));
    }
    prepareExternalUrl(n) {
      return (
        n && n[0] !== "/" && (n = "/" + n),
        this._locationStrategy.prepareExternalUrl(n)
      );
    }
    go(n, r = "", o = null) {
      this._locationStrategy.pushState(o, "", n, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(n + xn(r)), o);
    }
    replaceState(n, r = "", o = null) {
      this._locationStrategy.replaceState(o, "", n, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(n + xn(r)), o);
    }
    forward() {
      this._locationStrategy.forward();
    }
    back() {
      this._locationStrategy.back();
    }
    historyGo(n = 0) {
      this._locationStrategy.historyGo?.(n);
    }
    onUrlChange(n) {
      return (
        this._urlChangeListeners.push(n),
        (this._urlChangeSubscription ??= this.subscribe((r) => {
          this._notifyUrlChangeListeners(r.url, r.state);
        })),
        () => {
          let r = this._urlChangeListeners.indexOf(n);
          this._urlChangeListeners.splice(r, 1),
            this._urlChangeListeners.length === 0 &&
              (this._urlChangeSubscription?.unsubscribe(),
              (this._urlChangeSubscription = null));
        }
      );
    }
    _notifyUrlChangeListeners(n = "", r) {
      this._urlChangeListeners.forEach((o) => o(n, r));
    }
    subscribe(n, r, o) {
      return this._subject.subscribe({ next: n, error: r, complete: o });
    }
    static {
      this.normalizeQueryParams = xn;
    }
    static {
      this.joinWithSlash = Rg;
    }
    static {
      this.stripTrailingSlash = Sg;
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)(R(Ir));
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: () => kI(), providedIn: "root" });
    }
  }
  return e;
})();
function kI() {
  return new ho(R(Ir));
}
function LI(e, t) {
  if (!e || !t.startsWith(e)) return t;
  let n = t.substring(e.length);
  return n === "" || ["/", ";", "?", "#"].includes(n[0]) ? n : t;
}
function xg(e) {
  return e.replace(/\/index.html$/, "");
}
function VI(e) {
  if (new RegExp("^(https?:)?//").test(e)) {
    let [, n] = e.split(/\/\/[^\/]+/);
    return n;
  }
  return e;
}
function Rs(e, t) {
  t = encodeURIComponent(t);
  for (let n of e.split(";")) {
    let r = n.indexOf("="),
      [o, i] = r == -1 ? [n, ""] : [n.slice(0, r), n.slice(r + 1)];
    if (o.trim() === t) return decodeURIComponent(i);
  }
  return null;
}
var Pg = "browser",
  jI = "server";
function Os(e) {
  return e === jI;
}
var Er = class {};
var go = class {},
  Fs = class {},
  Tt = class e {
    constructor(t) {
      (this.normalizedNames = new Map()),
        (this.lazyUpdate = null),
        t
          ? typeof t == "string"
            ? (this.lazyInit = () => {
                (this.headers = new Map()),
                  t
                    .split(
                      `
`
                    )
                    .forEach((n) => {
                      let r = n.indexOf(":");
                      if (r > 0) {
                        let o = n.slice(0, r),
                          i = o.toLowerCase(),
                          s = n.slice(r + 1).trim();
                        this.maybeSetNormalizedName(o, i),
                          this.headers.has(i)
                            ? this.headers.get(i).push(s)
                            : this.headers.set(i, [s]);
                      }
                    });
              })
            : typeof Headers < "u" && t instanceof Headers
            ? ((this.headers = new Map()),
              t.forEach((n, r) => {
                this.setHeaderEntries(r, n);
              }))
            : (this.lazyInit = () => {
                (this.headers = new Map()),
                  Object.entries(t).forEach(([n, r]) => {
                    this.setHeaderEntries(n, r);
                  });
              })
          : (this.headers = new Map());
    }
    has(t) {
      return this.init(), this.headers.has(t.toLowerCase());
    }
    get(t) {
      this.init();
      let n = this.headers.get(t.toLowerCase());
      return n && n.length > 0 ? n[0] : null;
    }
    keys() {
      return this.init(), Array.from(this.normalizedNames.values());
    }
    getAll(t) {
      return this.init(), this.headers.get(t.toLowerCase()) || null;
    }
    append(t, n) {
      return this.clone({ name: t, value: n, op: "a" });
    }
    set(t, n) {
      return this.clone({ name: t, value: n, op: "s" });
    }
    delete(t, n) {
      return this.clone({ name: t, value: n, op: "d" });
    }
    maybeSetNormalizedName(t, n) {
      this.normalizedNames.has(n) || this.normalizedNames.set(n, t);
    }
    init() {
      this.lazyInit &&
        (this.lazyInit instanceof e
          ? this.copyFrom(this.lazyInit)
          : this.lazyInit(),
        (this.lazyInit = null),
        this.lazyUpdate &&
          (this.lazyUpdate.forEach((t) => this.applyUpdate(t)),
          (this.lazyUpdate = null)));
    }
    copyFrom(t) {
      t.init(),
        Array.from(t.headers.keys()).forEach((n) => {
          this.headers.set(n, t.headers.get(n)),
            this.normalizedNames.set(n, t.normalizedNames.get(n));
        });
    }
    clone(t) {
      let n = new e();
      return (
        (n.lazyInit =
          this.lazyInit && this.lazyInit instanceof e ? this.lazyInit : this),
        (n.lazyUpdate = (this.lazyUpdate || []).concat([t])),
        n
      );
    }
    applyUpdate(t) {
      let n = t.name.toLowerCase();
      switch (t.op) {
        case "a":
        case "s":
          let r = t.value;
          if ((typeof r == "string" && (r = [r]), r.length === 0)) return;
          this.maybeSetNormalizedName(t.name, n);
          let o = (t.op === "a" ? this.headers.get(n) : void 0) || [];
          o.push(...r), this.headers.set(n, o);
          break;
        case "d":
          let i = t.value;
          if (!i) this.headers.delete(n), this.normalizedNames.delete(n);
          else {
            let s = this.headers.get(n);
            if (!s) return;
            (s = s.filter((l) => i.indexOf(l) === -1)),
              s.length === 0
                ? (this.headers.delete(n), this.normalizedNames.delete(n))
                : this.headers.set(n, s);
          }
          break;
      }
    }
    setHeaderEntries(t, n) {
      let r = (Array.isArray(n) ? n : [n]).map((i) => i.toString()),
        o = t.toLowerCase();
      this.headers.set(o, r), this.maybeSetNormalizedName(t, o);
    }
    forEach(t) {
      this.init(),
        Array.from(this.normalizedNames.keys()).forEach((n) =>
          t(this.normalizedNames.get(n), this.headers.get(n))
        );
    }
  };
var Fl = class {
  encodeKey(t) {
    return kg(t);
  }
  encodeValue(t) {
    return kg(t);
  }
  decodeKey(t) {
    return decodeURIComponent(t);
  }
  decodeValue(t) {
    return decodeURIComponent(t);
  }
};
function BI(e, t) {
  let n = new Map();
  return (
    e.length > 0 &&
      e
        .replace(/^\?/, "")
        .split("&")
        .forEach((o) => {
          let i = o.indexOf("="),
            [s, l] =
              i == -1
                ? [t.decodeKey(o), ""]
                : [t.decodeKey(o.slice(0, i)), t.decodeValue(o.slice(i + 1))],
            u = n.get(s) || [];
          u.push(l), n.set(s, u);
        }),
    n
  );
}
var UI = /%(\d[a-f0-9])/gi,
  $I = {
    40: "@",
    "3A": ":",
    24: "$",
    "2C": ",",
    "3B": ";",
    "3D": "=",
    "3F": "?",
    "2F": "/",
  };
function kg(e) {
  return encodeURIComponent(e).replace(UI, (t, n) => $I[n] ?? t);
}
function Ps(e) {
  return `${e}`;
}
var nn = class e {
  constructor(t = {}) {
    if (
      ((this.updates = null),
      (this.cloneFrom = null),
      (this.encoder = t.encoder || new Fl()),
      t.fromString)
    ) {
      if (t.fromObject)
        throw new Error("Cannot specify both fromString and fromObject.");
      this.map = BI(t.fromString, this.encoder);
    } else
      t.fromObject
        ? ((this.map = new Map()),
          Object.keys(t.fromObject).forEach((n) => {
            let r = t.fromObject[n],
              o = Array.isArray(r) ? r.map(Ps) : [Ps(r)];
            this.map.set(n, o);
          }))
        : (this.map = null);
  }
  has(t) {
    return this.init(), this.map.has(t);
  }
  get(t) {
    this.init();
    let n = this.map.get(t);
    return n ? n[0] : null;
  }
  getAll(t) {
    return this.init(), this.map.get(t) || null;
  }
  keys() {
    return this.init(), Array.from(this.map.keys());
  }
  append(t, n) {
    return this.clone({ param: t, value: n, op: "a" });
  }
  appendAll(t) {
    let n = [];
    return (
      Object.keys(t).forEach((r) => {
        let o = t[r];
        Array.isArray(o)
          ? o.forEach((i) => {
              n.push({ param: r, value: i, op: "a" });
            })
          : n.push({ param: r, value: o, op: "a" });
      }),
      this.clone(n)
    );
  }
  set(t, n) {
    return this.clone({ param: t, value: n, op: "s" });
  }
  delete(t, n) {
    return this.clone({ param: t, value: n, op: "d" });
  }
  toString() {
    return (
      this.init(),
      this.keys()
        .map((t) => {
          let n = this.encoder.encodeKey(t);
          return this.map
            .get(t)
            .map((r) => n + "=" + this.encoder.encodeValue(r))
            .join("&");
        })
        .filter((t) => t !== "")
        .join("&")
    );
  }
  clone(t) {
    let n = new e({ encoder: this.encoder });
    return (
      (n.cloneFrom = this.cloneFrom || this),
      (n.updates = (this.updates || []).concat(t)),
      n
    );
  }
  init() {
    this.map === null && (this.map = new Map()),
      this.cloneFrom !== null &&
        (this.cloneFrom.init(),
        this.cloneFrom
          .keys()
          .forEach((t) => this.map.set(t, this.cloneFrom.map.get(t))),
        this.updates.forEach((t) => {
          switch (t.op) {
            case "a":
            case "s":
              let n = (t.op === "a" ? this.map.get(t.param) : void 0) || [];
              n.push(Ps(t.value)), this.map.set(t.param, n);
              break;
            case "d":
              if (t.value !== void 0) {
                let r = this.map.get(t.param) || [],
                  o = r.indexOf(Ps(t.value));
                o !== -1 && r.splice(o, 1),
                  r.length > 0
                    ? this.map.set(t.param, r)
                    : this.map.delete(t.param);
              } else {
                this.map.delete(t.param);
                break;
              }
          }
        }),
        (this.cloneFrom = this.updates = null));
  }
};
var kl = class {
  constructor() {
    this.map = new Map();
  }
  set(t, n) {
    return this.map.set(t, n), this;
  }
  get(t) {
    return (
      this.map.has(t) || this.map.set(t, t.defaultValue()), this.map.get(t)
    );
  }
  delete(t) {
    return this.map.delete(t), this;
  }
  has(t) {
    return this.map.has(t);
  }
  keys() {
    return this.map.keys();
  }
};
function HI(e) {
  switch (e) {
    case "DELETE":
    case "GET":
    case "HEAD":
    case "OPTIONS":
    case "JSONP":
      return !1;
    default:
      return !0;
  }
}
function Lg(e) {
  return typeof ArrayBuffer < "u" && e instanceof ArrayBuffer;
}
function Vg(e) {
  return typeof Blob < "u" && e instanceof Blob;
}
function jg(e) {
  return typeof FormData < "u" && e instanceof FormData;
}
function zI(e) {
  return typeof URLSearchParams < "u" && e instanceof URLSearchParams;
}
var po = class e {
    constructor(t, n, r, o) {
      (this.url = n),
        (this.body = null),
        (this.reportProgress = !1),
        (this.withCredentials = !1),
        (this.responseType = "json"),
        (this.method = t.toUpperCase());
      let i;
      if (
        (HI(this.method) || o
          ? ((this.body = r !== void 0 ? r : null), (i = o))
          : (i = r),
        i &&
          ((this.reportProgress = !!i.reportProgress),
          (this.withCredentials = !!i.withCredentials),
          i.responseType && (this.responseType = i.responseType),
          i.headers && (this.headers = i.headers),
          i.context && (this.context = i.context),
          i.params && (this.params = i.params),
          (this.transferCache = i.transferCache)),
        (this.headers ??= new Tt()),
        (this.context ??= new kl()),
        !this.params)
      )
        (this.params = new nn()), (this.urlWithParams = n);
      else {
        let s = this.params.toString();
        if (s.length === 0) this.urlWithParams = n;
        else {
          let l = n.indexOf("?"),
            u = l === -1 ? "?" : l < n.length - 1 ? "&" : "";
          this.urlWithParams = n + u + s;
        }
      }
    }
    serializeBody() {
      return this.body === null
        ? null
        : typeof this.body == "string" ||
          Lg(this.body) ||
          Vg(this.body) ||
          jg(this.body) ||
          zI(this.body)
        ? this.body
        : this.body instanceof nn
        ? this.body.toString()
        : typeof this.body == "object" ||
          typeof this.body == "boolean" ||
          Array.isArray(this.body)
        ? JSON.stringify(this.body)
        : this.body.toString();
    }
    detectContentTypeHeader() {
      return this.body === null || jg(this.body)
        ? null
        : Vg(this.body)
        ? this.body.type || null
        : Lg(this.body)
        ? null
        : typeof this.body == "string"
        ? "text/plain"
        : this.body instanceof nn
        ? "application/x-www-form-urlencoded;charset=UTF-8"
        : typeof this.body == "object" ||
          typeof this.body == "number" ||
          typeof this.body == "boolean"
        ? "application/json"
        : null;
    }
    clone(t = {}) {
      let n = t.method || this.method,
        r = t.url || this.url,
        o = t.responseType || this.responseType,
        i = t.transferCache ?? this.transferCache,
        s = t.body !== void 0 ? t.body : this.body,
        l = t.withCredentials ?? this.withCredentials,
        u = t.reportProgress ?? this.reportProgress,
        f = t.headers || this.headers,
        g = t.params || this.params,
        h = t.context ?? this.context;
      return (
        t.setHeaders !== void 0 &&
          (f = Object.keys(t.setHeaders).reduce(
            (w, v) => w.set(v, t.setHeaders[v]),
            f
          )),
        t.setParams &&
          (g = Object.keys(t.setParams).reduce(
            (w, v) => w.set(v, t.setParams[v]),
            g
          )),
        new e(n, r, s, {
          params: g,
          headers: f,
          context: h,
          reportProgress: u,
          responseType: o,
          withCredentials: l,
          transferCache: i,
        })
      );
    }
  },
  rn = (function (e) {
    return (
      (e[(e.Sent = 0)] = "Sent"),
      (e[(e.UploadProgress = 1)] = "UploadProgress"),
      (e[(e.ResponseHeader = 2)] = "ResponseHeader"),
      (e[(e.DownloadProgress = 3)] = "DownloadProgress"),
      (e[(e.Response = 4)] = "Response"),
      (e[(e.User = 5)] = "User"),
      e
    );
  })(rn || {}),
  mo = class {
    constructor(t, n = 200, r = "OK") {
      (this.headers = t.headers || new Tt()),
        (this.status = t.status !== void 0 ? t.status : n),
        (this.statusText = t.statusText || r),
        (this.url = t.url || null),
        (this.ok = this.status >= 200 && this.status < 300);
    }
  },
  ks = class e extends mo {
    constructor(t = {}) {
      super(t), (this.type = rn.ResponseHeader);
    }
    clone(t = {}) {
      return new e({
        headers: t.headers || this.headers,
        status: t.status !== void 0 ? t.status : this.status,
        statusText: t.statusText || this.statusText,
        url: t.url || this.url || void 0,
      });
    }
  },
  vo = class e extends mo {
    constructor(t = {}) {
      super(t),
        (this.type = rn.Response),
        (this.body = t.body !== void 0 ? t.body : null);
    }
    clone(t = {}) {
      return new e({
        body: t.body !== void 0 ? t.body : this.body,
        headers: t.headers || this.headers,
        status: t.status !== void 0 ? t.status : this.status,
        statusText: t.statusText || this.statusText,
        url: t.url || this.url || void 0,
      });
    }
  },
  tn = class extends mo {
    constructor(t) {
      super(t, 0, "Unknown Error"),
        (this.name = "HttpErrorResponse"),
        (this.ok = !1),
        this.status >= 200 && this.status < 300
          ? (this.message = `Http failure during parsing for ${
              t.url || "(unknown url)"
            }`)
          : (this.message = `Http failure response for ${
              t.url || "(unknown url)"
            }: ${t.status} ${t.statusText}`),
        (this.error = t.error || null);
    }
  },
  Hg = 200,
  GI = 204;
function Pl(e, t) {
  return {
    body: t,
    headers: e.headers,
    context: e.context,
    observe: e.observe,
    params: e.params,
    reportProgress: e.reportProgress,
    responseType: e.responseType,
    withCredentials: e.withCredentials,
    transferCache: e.transferCache,
  };
}
var jl = (() => {
    class e {
      constructor(n) {
        this.handler = n;
      }
      request(n, r, o = {}) {
        let i;
        if (n instanceof po) i = n;
        else {
          let u;
          o.headers instanceof Tt ? (u = o.headers) : (u = new Tt(o.headers));
          let f;
          o.params &&
            (o.params instanceof nn
              ? (f = o.params)
              : (f = new nn({ fromObject: o.params }))),
            (i = new po(n, r, o.body !== void 0 ? o.body : null, {
              headers: u,
              context: o.context,
              params: f,
              reportProgress: o.reportProgress,
              responseType: o.responseType || "json",
              withCredentials: o.withCredentials,
              transferCache: o.transferCache,
            }));
        }
        let s = T(i).pipe(Vt((u) => this.handler.handle(u)));
        if (n instanceof po || o.observe === "events") return s;
        let l = s.pipe(Ve((u) => u instanceof vo));
        switch (o.observe || "body") {
          case "body":
            switch (i.responseType) {
              case "arraybuffer":
                return l.pipe(
                  O((u) => {
                    if (u.body !== null && !(u.body instanceof ArrayBuffer))
                      throw new Error("Response is not an ArrayBuffer.");
                    return u.body;
                  })
                );
              case "blob":
                return l.pipe(
                  O((u) => {
                    if (u.body !== null && !(u.body instanceof Blob))
                      throw new Error("Response is not a Blob.");
                    return u.body;
                  })
                );
              case "text":
                return l.pipe(
                  O((u) => {
                    if (u.body !== null && typeof u.body != "string")
                      throw new Error("Response is not a string.");
                    return u.body;
                  })
                );
              case "json":
              default:
                return l.pipe(O((u) => u.body));
            }
          case "response":
            return l;
          default:
            throw new Error(
              `Unreachable: unhandled observe type ${o.observe}}`
            );
        }
      }
      delete(n, r = {}) {
        return this.request("DELETE", n, r);
      }
      get(n, r = {}) {
        return this.request("GET", n, r);
      }
      head(n, r = {}) {
        return this.request("HEAD", n, r);
      }
      jsonp(n, r) {
        return this.request("JSONP", n, {
          params: new nn().append(r, "JSONP_CALLBACK"),
          observe: "body",
          responseType: "json",
        });
      }
      options(n, r = {}) {
        return this.request("OPTIONS", n, r);
      }
      patch(n, r, o = {}) {
        return this.request("PATCH", n, Pl(o, r));
      }
      post(n, r, o = {}) {
        return this.request("POST", n, Pl(o, r));
      }
      put(n, r, o = {}) {
        return this.request("PUT", n, Pl(o, r));
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(go));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  qI = /^\)\]\}',?\n/,
  WI = "X-Request-URL";
function Bg(e) {
  if (e.url) return e.url;
  let t = WI.toLocaleLowerCase();
  return e.headers.get(t);
}
var ZI = (() => {
    class e {
      constructor() {
        (this.fetchImpl =
          y(Ll, { optional: !0 })?.fetch ?? ((...n) => globalThis.fetch(...n))),
          (this.ngZone = y(ie));
      }
      handle(n) {
        return new $((r) => {
          let o = new AbortController();
          return (
            this.doRequest(n, o.signal, r).then(Vl, (i) =>
              r.error(new tn({ error: i }))
            ),
            () => o.abort()
          );
        });
      }
      doRequest(n, r, o) {
        return Hn(this, null, function* () {
          let i = this.createRequestInit(n),
            s;
          try {
            let v = this.ngZone.runOutsideAngular(() =>
              this.fetchImpl(n.urlWithParams, b({ signal: r }, i))
            );
            YI(v), o.next({ type: rn.Sent }), (s = yield v);
          } catch (v) {
            o.error(
              new tn({
                error: v,
                status: v.status ?? 0,
                statusText: v.statusText,
                url: n.urlWithParams,
                headers: v.headers,
              })
            );
            return;
          }
          let l = new Tt(s.headers),
            u = s.statusText,
            f = Bg(s) ?? n.urlWithParams,
            g = s.status,
            h = null;
          if (
            (n.reportProgress &&
              o.next(new ks({ headers: l, status: g, statusText: u, url: f })),
            s.body)
          ) {
            let v = s.headers.get("content-length"),
              D = [],
              I = s.body.getReader(),
              E = 0,
              x,
              ee,
              j = typeof Zone < "u" && Zone.current;
            yield this.ngZone.runOutsideAngular(() =>
              Hn(this, null, function* () {
                for (;;) {
                  let { done: he, value: ne } = yield I.read();
                  if (he) break;
                  if ((D.push(ne), (E += ne.length), n.reportProgress)) {
                    ee =
                      n.responseType === "text"
                        ? (ee ?? "") +
                          (x ??= new TextDecoder()).decode(ne, { stream: !0 })
                        : void 0;
                    let Ee = () =>
                      o.next({
                        type: rn.DownloadProgress,
                        total: v ? +v : void 0,
                        loaded: E,
                        partialText: ee,
                      });
                    j ? j.run(Ee) : Ee();
                  }
                }
              })
            );
            let ce = this.concatChunks(D, E);
            try {
              let he = s.headers.get("Content-Type") ?? "";
              h = this.parseBody(n, ce, he);
            } catch (he) {
              o.error(
                new tn({
                  error: he,
                  headers: new Tt(s.headers),
                  status: s.status,
                  statusText: s.statusText,
                  url: Bg(s) ?? n.urlWithParams,
                })
              );
              return;
            }
          }
          g === 0 && (g = h ? Hg : 0),
            g >= 200 && g < 300
              ? (o.next(
                  new vo({
                    body: h,
                    headers: l,
                    status: g,
                    statusText: u,
                    url: f,
                  })
                ),
                o.complete())
              : o.error(
                  new tn({
                    error: h,
                    headers: l,
                    status: g,
                    statusText: u,
                    url: f,
                  })
                );
        });
      }
      parseBody(n, r, o) {
        switch (n.responseType) {
          case "json":
            let i = new TextDecoder().decode(r).replace(qI, "");
            return i === "" ? null : JSON.parse(i);
          case "text":
            return new TextDecoder().decode(r);
          case "blob":
            return new Blob([r], { type: o });
          case "arraybuffer":
            return r.buffer;
        }
      }
      createRequestInit(n) {
        let r = {},
          o = n.withCredentials ? "include" : void 0;
        if (
          (n.headers.forEach((i, s) => (r[i] = s.join(","))),
          n.headers.has("Accept") ||
            (r.Accept = "application/json, text/plain, */*"),
          !n.headers.has("Content-Type"))
        ) {
          let i = n.detectContentTypeHeader();
          i !== null && (r["Content-Type"] = i);
        }
        return {
          body: n.serializeBody(),
          method: n.method,
          headers: r,
          credentials: o,
        };
      }
      concatChunks(n, r) {
        let o = new Uint8Array(r),
          i = 0;
        for (let s of n) o.set(s, i), (i += s.length);
        return o;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Ll = class {};
function Vl() {}
function YI(e) {
  e.then(Vl, Vl);
}
function QI(e, t) {
  return t(e);
}
function KI(e, t, n) {
  return (r, o) => nt(n, () => t(r, (i) => e(i, o)));
}
var Bl = new M(""),
  XI = new M(""),
  JI = new M("", { providedIn: "root", factory: () => !0 });
var Ug = (() => {
  class e extends go {
    constructor(n, r) {
      super(),
        (this.backend = n),
        (this.injector = r),
        (this.chain = null),
        (this.pendingTasks = y(Qt)),
        (this.contributeToStability = y(JI));
    }
    handle(n) {
      if (this.chain === null) {
        let r = Array.from(
          new Set([...this.injector.get(Bl), ...this.injector.get(XI, [])])
        );
        this.chain = r.reduceRight((o, i) => KI(o, i, this.injector), QI);
      }
      if (this.contributeToStability) {
        let r = this.pendingTasks.add();
        return this.chain(n, (o) => this.backend.handle(o)).pipe(
          mn(() => this.pendingTasks.remove(r))
        );
      } else return this.chain(n, (r) => this.backend.handle(r));
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)(R(Fs), R(Ne));
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac });
    }
  }
  return e;
})();
var e_ = /^\)\]\}',?\n/;
function t_(e) {
  return "responseURL" in e && e.responseURL
    ? e.responseURL
    : /^X-Request-URL:/m.test(e.getAllResponseHeaders())
    ? e.getResponseHeader("X-Request-URL")
    : null;
}
var $g = (() => {
    class e {
      constructor(n) {
        this.xhrFactory = n;
      }
      handle(n) {
        if (n.method === "JSONP") throw new _(-2800, !1);
        let r = this.xhrFactory;
        return (r.ɵloadImpl ? oe(r.ɵloadImpl()) : T(null)).pipe(
          Te(
            () =>
              new $((i) => {
                let s = r.build();
                if (
                  (s.open(n.method, n.urlWithParams),
                  n.withCredentials && (s.withCredentials = !0),
                  n.headers.forEach((I, E) =>
                    s.setRequestHeader(I, E.join(","))
                  ),
                  n.headers.has("Accept") ||
                    s.setRequestHeader(
                      "Accept",
                      "application/json, text/plain, */*"
                    ),
                  !n.headers.has("Content-Type"))
                ) {
                  let I = n.detectContentTypeHeader();
                  I !== null && s.setRequestHeader("Content-Type", I);
                }
                if (n.responseType) {
                  let I = n.responseType.toLowerCase();
                  s.responseType = I !== "json" ? I : "text";
                }
                let l = n.serializeBody(),
                  u = null,
                  f = () => {
                    if (u !== null) return u;
                    let I = s.statusText || "OK",
                      E = new Tt(s.getAllResponseHeaders()),
                      x = t_(s) || n.url;
                    return (
                      (u = new ks({
                        headers: E,
                        status: s.status,
                        statusText: I,
                        url: x,
                      })),
                      u
                    );
                  },
                  g = () => {
                    let { headers: I, status: E, statusText: x, url: ee } = f(),
                      j = null;
                    E !== GI &&
                      (j =
                        typeof s.response > "u" ? s.responseText : s.response),
                      E === 0 && (E = j ? Hg : 0);
                    let ce = E >= 200 && E < 300;
                    if (n.responseType === "json" && typeof j == "string") {
                      let he = j;
                      j = j.replace(e_, "");
                      try {
                        j = j !== "" ? JSON.parse(j) : null;
                      } catch (ne) {
                        (j = he),
                          ce && ((ce = !1), (j = { error: ne, text: j }));
                      }
                    }
                    ce
                      ? (i.next(
                          new vo({
                            body: j,
                            headers: I,
                            status: E,
                            statusText: x,
                            url: ee || void 0,
                          })
                        ),
                        i.complete())
                      : i.error(
                          new tn({
                            error: j,
                            headers: I,
                            status: E,
                            statusText: x,
                            url: ee || void 0,
                          })
                        );
                  },
                  h = (I) => {
                    let { url: E } = f(),
                      x = new tn({
                        error: I,
                        status: s.status || 0,
                        statusText: s.statusText || "Unknown Error",
                        url: E || void 0,
                      });
                    i.error(x);
                  },
                  w = !1,
                  v = (I) => {
                    w || (i.next(f()), (w = !0));
                    let E = { type: rn.DownloadProgress, loaded: I.loaded };
                    I.lengthComputable && (E.total = I.total),
                      n.responseType === "text" &&
                        s.responseText &&
                        (E.partialText = s.responseText),
                      i.next(E);
                  },
                  D = (I) => {
                    let E = { type: rn.UploadProgress, loaded: I.loaded };
                    I.lengthComputable && (E.total = I.total), i.next(E);
                  };
                return (
                  s.addEventListener("load", g),
                  s.addEventListener("error", h),
                  s.addEventListener("timeout", h),
                  s.addEventListener("abort", h),
                  n.reportProgress &&
                    (s.addEventListener("progress", v),
                    l !== null &&
                      s.upload &&
                      s.upload.addEventListener("progress", D)),
                  s.send(l),
                  i.next({ type: rn.Sent }),
                  () => {
                    s.removeEventListener("error", h),
                      s.removeEventListener("abort", h),
                      s.removeEventListener("load", g),
                      s.removeEventListener("timeout", h),
                      n.reportProgress &&
                        (s.removeEventListener("progress", v),
                        l !== null &&
                          s.upload &&
                          s.upload.removeEventListener("progress", D)),
                      s.readyState !== s.DONE && s.abort();
                  }
                );
              })
          )
        );
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Er));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  zg = new M(""),
  n_ = "XSRF-TOKEN",
  r_ = new M("", { providedIn: "root", factory: () => n_ }),
  o_ = "X-XSRF-TOKEN",
  i_ = new M("", { providedIn: "root", factory: () => o_ }),
  Ls = class {},
  s_ = (() => {
    class e {
      constructor(n, r, o) {
        (this.doc = n),
          (this.platform = r),
          (this.cookieName = o),
          (this.lastCookieString = ""),
          (this.lastToken = null),
          (this.parseCount = 0);
      }
      getToken() {
        if (this.platform === "server") return null;
        let n = this.doc.cookie || "";
        return (
          n !== this.lastCookieString &&
            (this.parseCount++,
            (this.lastToken = Rs(n, this.cookieName)),
            (this.lastCookieString = n)),
          this.lastToken
        );
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Re), R(Xt), R(r_));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })();
function a_(e, t) {
  let n = e.url.toLowerCase();
  if (
    !y(zg) ||
    e.method === "GET" ||
    e.method === "HEAD" ||
    n.startsWith("http://") ||
    n.startsWith("https://")
  )
    return t(e);
  let r = y(Ls).getToken(),
    o = y(i_);
  return (
    r != null &&
      !e.headers.has(o) &&
      (e = e.clone({ headers: e.headers.set(o, r) })),
    t(e)
  );
}
var Gg = (function (e) {
  return (
    (e[(e.Interceptors = 0)] = "Interceptors"),
    (e[(e.LegacyInterceptors = 1)] = "LegacyInterceptors"),
    (e[(e.CustomXsrfConfiguration = 2)] = "CustomXsrfConfiguration"),
    (e[(e.NoXsrfProtection = 3)] = "NoXsrfProtection"),
    (e[(e.JsonpSupport = 4)] = "JsonpSupport"),
    (e[(e.RequestsMadeViaParent = 5)] = "RequestsMadeViaParent"),
    (e[(e.Fetch = 6)] = "Fetch"),
    e
  );
})(Gg || {});
function c_(e, t) {
  return { ɵkind: e, ɵproviders: t };
}
function qg(...e) {
  let t = [
    jl,
    $g,
    Ug,
    { provide: go, useExisting: Ug },
    { provide: Fs, useFactory: () => y(ZI, { optional: !0 }) ?? y($g) },
    { provide: Bl, useValue: a_, multi: !0 },
    { provide: zg, useValue: !0 },
    { provide: Ls, useClass: s_ },
  ];
  for (let n of e) t.push(...n.ɵproviders);
  return wr(t);
}
function Wg(e) {
  return c_(
    Gg.Interceptors,
    e.map((t) => ({ provide: Bl, useValue: t, multi: !0 }))
  );
}
var Hl = class extends Ns {
    constructor() {
      super(...arguments), (this.supportsDOMEvents = !0);
    }
  },
  zl = class e extends Hl {
    static makeCurrent() {
      Ag(new e());
    }
    onAndCancel(t, n, r) {
      return (
        t.addEventListener(n, r),
        () => {
          t.removeEventListener(n, r);
        }
      );
    }
    dispatchEvent(t, n) {
      t.dispatchEvent(n);
    }
    remove(t) {
      t.remove();
    }
    createElement(t, n) {
      return (n = n || this.getDefaultDocument()), n.createElement(t);
    }
    createHtmlDocument() {
      return document.implementation.createHTMLDocument("fakeTitle");
    }
    getDefaultDocument() {
      return document;
    }
    isElementNode(t) {
      return t.nodeType === Node.ELEMENT_NODE;
    }
    isShadowRoot(t) {
      return t instanceof DocumentFragment;
    }
    getGlobalEventTarget(t, n) {
      return n === "window"
        ? window
        : n === "document"
        ? t
        : n === "body"
        ? t.body
        : null;
    }
    getBaseHref(t) {
      let n = u_();
      return n == null ? null : d_(n);
    }
    resetBaseElement() {
      yo = null;
    }
    getUserAgent() {
      return window.navigator.userAgent;
    }
    getCookie(t) {
      return Rs(document.cookie, t);
    }
  },
  yo = null;
function u_() {
  return (
    (yo = yo || document.querySelector("base")),
    yo ? yo.getAttribute("href") : null
  );
}
function d_(e) {
  return new URL(e, document.baseURI).pathname;
}
var f_ = (() => {
    class e {
      build() {
        return new XMLHttpRequest();
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Gl = new M(""),
  Kg = (() => {
    class e {
      constructor(n, r) {
        (this._zone = r),
          (this._eventNameToPlugin = new Map()),
          n.forEach((o) => {
            o.manager = this;
          }),
          (this._plugins = n.slice().reverse());
      }
      addEventListener(n, r, o) {
        return this._findPluginFor(r).addEventListener(n, r, o);
      }
      getZone() {
        return this._zone;
      }
      _findPluginFor(n) {
        let r = this._eventNameToPlugin.get(n);
        if (r) return r;
        if (((r = this._plugins.find((i) => i.supports(n))), !r))
          throw new _(5101, !1);
        return this._eventNameToPlugin.set(n, r), r;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Gl), R(ie));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Vs = class {
    constructor(t) {
      this._doc = t;
    }
  },
  Ul = "ng-app-id",
  Xg = (() => {
    class e {
      constructor(n, r, o, i = {}) {
        (this.doc = n),
          (this.appId = r),
          (this.nonce = o),
          (this.platformId = i),
          (this.styleRef = new Map()),
          (this.hostNodes = new Set()),
          (this.styleNodesInDOM = this.collectServerRenderedStyles()),
          (this.platformIsServer = Os(i)),
          this.resetHostNodes();
      }
      addStyles(n) {
        for (let r of n)
          this.changeUsageCount(r, 1) === 1 && this.onStyleAdded(r);
      }
      removeStyles(n) {
        for (let r of n)
          this.changeUsageCount(r, -1) <= 0 && this.onStyleRemoved(r);
      }
      ngOnDestroy() {
        let n = this.styleNodesInDOM;
        n && (n.forEach((r) => r.remove()), n.clear());
        for (let r of this.getAllStyles()) this.onStyleRemoved(r);
        this.resetHostNodes();
      }
      addHost(n) {
        this.hostNodes.add(n);
        for (let r of this.getAllStyles()) this.addStyleToHost(n, r);
      }
      removeHost(n) {
        this.hostNodes.delete(n);
      }
      getAllStyles() {
        return this.styleRef.keys();
      }
      onStyleAdded(n) {
        for (let r of this.hostNodes) this.addStyleToHost(r, n);
      }
      onStyleRemoved(n) {
        let r = this.styleRef;
        r.get(n)?.elements?.forEach((o) => o.remove()), r.delete(n);
      }
      collectServerRenderedStyles() {
        let n = this.doc.head?.querySelectorAll(`style[${Ul}="${this.appId}"]`);
        if (n?.length) {
          let r = new Map();
          return (
            n.forEach((o) => {
              o.textContent != null && r.set(o.textContent, o);
            }),
            r
          );
        }
        return null;
      }
      changeUsageCount(n, r) {
        let o = this.styleRef;
        if (o.has(n)) {
          let i = o.get(n);
          return (i.usage += r), i.usage;
        }
        return o.set(n, { usage: r, elements: [] }), r;
      }
      getStyleElement(n, r) {
        let o = this.styleNodesInDOM,
          i = o?.get(r);
        if (i?.parentNode === n) return o.delete(r), i.removeAttribute(Ul), i;
        {
          let s = this.doc.createElement("style");
          return (
            this.nonce && s.setAttribute("nonce", this.nonce),
            (s.textContent = r),
            this.platformIsServer && s.setAttribute(Ul, this.appId),
            n.appendChild(s),
            s
          );
        }
      }
      addStyleToHost(n, r) {
        let o = this.getStyleElement(n, r),
          i = this.styleRef,
          s = i.get(r)?.elements;
        s ? s.push(o) : i.set(r, { elements: [o], usage: 1 });
      }
      resetHostNodes() {
        let n = this.hostNodes;
        n.clear(), n.add(this.doc.head);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Re), R(gl), R(vl, 8), R(Xt));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  $l = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
    math: "http://www.w3.org/1998/Math/MathML",
  },
  Wl = /%COMP%/g,
  Jg = "%COMP%",
  h_ = `_nghost-${Jg}`,
  p_ = `_ngcontent-${Jg}`,
  g_ = !0,
  m_ = new M("", { providedIn: "root", factory: () => g_ });
function v_(e) {
  return p_.replace(Wl, e);
}
function y_(e) {
  return h_.replace(Wl, e);
}
function em(e, t) {
  return t.map((n) => n.replace(Wl, e));
}
var Zg = (() => {
    class e {
      constructor(n, r, o, i, s, l, u, f = null) {
        (this.eventManager = n),
          (this.sharedStylesHost = r),
          (this.appId = o),
          (this.removeStylesOnCompDestroy = i),
          (this.doc = s),
          (this.platformId = l),
          (this.ngZone = u),
          (this.nonce = f),
          (this.rendererByCompId = new Map()),
          (this.platformIsServer = Os(l)),
          (this.defaultRenderer = new wo(n, s, u, this.platformIsServer));
      }
      createRenderer(n, r) {
        if (!n || !r) return this.defaultRenderer;
        this.platformIsServer &&
          r.encapsulation === ft.ShadowDom &&
          (r = U(b({}, r), { encapsulation: ft.Emulated }));
        let o = this.getOrCreateRenderer(n, r);
        return (
          o instanceof js
            ? o.applyToHost(n)
            : o instanceof Do && o.applyStyles(),
          o
        );
      }
      getOrCreateRenderer(n, r) {
        let o = this.rendererByCompId,
          i = o.get(r.id);
        if (!i) {
          let s = this.doc,
            l = this.ngZone,
            u = this.eventManager,
            f = this.sharedStylesHost,
            g = this.removeStylesOnCompDestroy,
            h = this.platformIsServer;
          switch (r.encapsulation) {
            case ft.Emulated:
              i = new js(u, f, r, this.appId, g, s, l, h);
              break;
            case ft.ShadowDom:
              return new ql(u, f, n, r, s, l, this.nonce, h);
            default:
              i = new Do(u, f, r, g, s, l, h);
              break;
          }
          o.set(r.id, i);
        }
        return i;
      }
      ngOnDestroy() {
        this.rendererByCompId.clear();
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(
            R(Kg),
            R(Xg),
            R(gl),
            R(m_),
            R(Re),
            R(Xt),
            R(ie),
            R(vl)
          );
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  wo = class {
    constructor(t, n, r, o) {
      (this.eventManager = t),
        (this.doc = n),
        (this.ngZone = r),
        (this.platformIsServer = o),
        (this.data = Object.create(null)),
        (this.throwOnSyntheticProps = !0),
        (this.destroyNode = null);
    }
    destroy() {}
    createElement(t, n) {
      return n
        ? this.doc.createElementNS($l[n] || n, t)
        : this.doc.createElement(t);
    }
    createComment(t) {
      return this.doc.createComment(t);
    }
    createText(t) {
      return this.doc.createTextNode(t);
    }
    appendChild(t, n) {
      (Yg(t) ? t.content : t).appendChild(n);
    }
    insertBefore(t, n, r) {
      t && (Yg(t) ? t.content : t).insertBefore(n, r);
    }
    removeChild(t, n) {
      n.remove();
    }
    selectRootElement(t, n) {
      let r = typeof t == "string" ? this.doc.querySelector(t) : t;
      if (!r) throw new _(-5104, !1);
      return n || (r.textContent = ""), r;
    }
    parentNode(t) {
      return t.parentNode;
    }
    nextSibling(t) {
      return t.nextSibling;
    }
    setAttribute(t, n, r, o) {
      if (o) {
        n = o + ":" + n;
        let i = $l[o];
        i ? t.setAttributeNS(i, n, r) : t.setAttribute(n, r);
      } else t.setAttribute(n, r);
    }
    removeAttribute(t, n, r) {
      if (r) {
        let o = $l[r];
        o ? t.removeAttributeNS(o, n) : t.removeAttribute(`${r}:${n}`);
      } else t.removeAttribute(n);
    }
    addClass(t, n) {
      t.classList.add(n);
    }
    removeClass(t, n) {
      t.classList.remove(n);
    }
    setStyle(t, n, r, o) {
      o & (It.DashCase | It.Important)
        ? t.style.setProperty(n, r, o & It.Important ? "important" : "")
        : (t.style[n] = r);
    }
    removeStyle(t, n, r) {
      r & It.DashCase ? t.style.removeProperty(n) : (t.style[n] = "");
    }
    setProperty(t, n, r) {
      t != null && (t[n] = r);
    }
    setValue(t, n) {
      t.nodeValue = n;
    }
    listen(t, n, r) {
      if (
        typeof t == "string" &&
        ((t = xt().getGlobalEventTarget(this.doc, t)), !t)
      )
        throw new Error(`Unsupported event target ${t} for event ${n}`);
      return this.eventManager.addEventListener(
        t,
        n,
        this.decoratePreventDefault(r)
      );
    }
    decoratePreventDefault(t) {
      return (n) => {
        if (n === "__ngUnwrap__") return t;
        (this.platformIsServer ? this.ngZone.runGuarded(() => t(n)) : t(n)) ===
          !1 && n.preventDefault();
      };
    }
  };
function Yg(e) {
  return e.tagName === "TEMPLATE" && e.content !== void 0;
}
var ql = class extends wo {
    constructor(t, n, r, o, i, s, l, u) {
      super(t, i, s, u),
        (this.sharedStylesHost = n),
        (this.hostEl = r),
        (this.shadowRoot = r.attachShadow({ mode: "open" })),
        this.sharedStylesHost.addHost(this.shadowRoot);
      let f = em(o.id, o.styles);
      for (let g of f) {
        let h = document.createElement("style");
        l && h.setAttribute("nonce", l),
          (h.textContent = g),
          this.shadowRoot.appendChild(h);
      }
    }
    nodeOrShadowRoot(t) {
      return t === this.hostEl ? this.shadowRoot : t;
    }
    appendChild(t, n) {
      return super.appendChild(this.nodeOrShadowRoot(t), n);
    }
    insertBefore(t, n, r) {
      return super.insertBefore(this.nodeOrShadowRoot(t), n, r);
    }
    removeChild(t, n) {
      return super.removeChild(null, n);
    }
    parentNode(t) {
      return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(t)));
    }
    destroy() {
      this.sharedStylesHost.removeHost(this.shadowRoot);
    }
  },
  Do = class extends wo {
    constructor(t, n, r, o, i, s, l, u) {
      super(t, i, s, l),
        (this.sharedStylesHost = n),
        (this.removeStylesOnCompDestroy = o),
        (this.styles = u ? em(u, r.styles) : r.styles);
    }
    applyStyles() {
      this.sharedStylesHost.addStyles(this.styles);
    }
    destroy() {
      this.removeStylesOnCompDestroy &&
        this.sharedStylesHost.removeStyles(this.styles);
    }
  },
  js = class extends Do {
    constructor(t, n, r, o, i, s, l, u) {
      let f = o + "-" + r.id;
      super(t, n, r, i, s, l, u, f),
        (this.contentAttr = v_(f)),
        (this.hostAttr = y_(f));
    }
    applyToHost(t) {
      this.applyStyles(), this.setAttribute(t, this.hostAttr, "");
    }
    createElement(t, n) {
      let r = super.createElement(t, n);
      return super.setAttribute(r, this.contentAttr, ""), r;
    }
  },
  w_ = (() => {
    class e extends Vs {
      constructor(n) {
        super(n);
      }
      supports(n) {
        return !0;
      }
      addEventListener(n, r, o) {
        return (
          n.addEventListener(r, o, !1), () => this.removeEventListener(n, r, o)
        );
      }
      removeEventListener(n, r, o) {
        return n.removeEventListener(r, o);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Re));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })(),
  Qg = ["alt", "control", "meta", "shift"],
  D_ = {
    "\b": "Backspace",
    "	": "Tab",
    "\x7F": "Delete",
    "\x1B": "Escape",
    Del: "Delete",
    Esc: "Escape",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    Up: "ArrowUp",
    Down: "ArrowDown",
    Menu: "ContextMenu",
    Scroll: "ScrollLock",
    Win: "OS",
  },
  b_ = {
    alt: (e) => e.altKey,
    control: (e) => e.ctrlKey,
    meta: (e) => e.metaKey,
    shift: (e) => e.shiftKey,
  },
  C_ = (() => {
    class e extends Vs {
      constructor(n) {
        super(n);
      }
      supports(n) {
        return e.parseEventName(n) != null;
      }
      addEventListener(n, r, o) {
        let i = e.parseEventName(r),
          s = e.eventCallback(i.fullKey, o, this.manager.getZone());
        return this.manager
          .getZone()
          .runOutsideAngular(() => xt().onAndCancel(n, i.domEventName, s));
      }
      static parseEventName(n) {
        let r = n.toLowerCase().split("."),
          o = r.shift();
        if (r.length === 0 || !(o === "keydown" || o === "keyup")) return null;
        let i = e._normalizeKey(r.pop()),
          s = "",
          l = r.indexOf("code");
        if (
          (l > -1 && (r.splice(l, 1), (s = "code.")),
          Qg.forEach((f) => {
            let g = r.indexOf(f);
            g > -1 && (r.splice(g, 1), (s += f + "."));
          }),
          (s += i),
          r.length != 0 || i.length === 0)
        )
          return null;
        let u = {};
        return (u.domEventName = o), (u.fullKey = s), u;
      }
      static matchEventFullKeyCode(n, r) {
        let o = D_[n.key] || n.key,
          i = "";
        return (
          r.indexOf("code.") > -1 && ((o = n.code), (i = "code.")),
          o == null || !o
            ? !1
            : ((o = o.toLowerCase()),
              o === " " ? (o = "space") : o === "." && (o = "dot"),
              Qg.forEach((s) => {
                if (s !== o) {
                  let l = b_[s];
                  l(n) && (i += s + ".");
                }
              }),
              (i += o),
              i === r)
        );
      }
      static eventCallback(n, r, o) {
        return (i) => {
          e.matchEventFullKeyCode(i, n) && o.runGuarded(() => r(i));
        };
      }
      static _normalizeKey(n) {
        return n === "esc" ? "escape" : n;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Re));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })();
function tm(e, t) {
  return _g(b({ rootComponent: e }, E_(t)));
}
function E_(e) {
  return {
    appProviders: [...x_, ...(e?.providers ?? [])],
    platformProviders: S_,
  };
}
function I_() {
  zl.makeCurrent();
}
function __() {
  return new Et();
}
function M_() {
  return Op(document), document;
}
var S_ = [
  { provide: Xt, useValue: Pg },
  { provide: ml, useValue: I_, multi: !0 },
  { provide: Re, useFactory: M_, deps: [] },
];
var x_ = [
  { provide: ps, useValue: "root" },
  { provide: Et, useFactory: __, deps: [] },
  { provide: Gl, useClass: w_, multi: !0, deps: [Re, ie, Xt] },
  { provide: Gl, useClass: C_, multi: !0, deps: [Re] },
  Zg,
  Xg,
  Kg,
  { provide: gr, useExisting: Zg },
  { provide: Er, useClass: f_, deps: [] },
  [],
];
var nm = (() => {
  class e {
    constructor(n) {
      this._doc = n;
    }
    getTitle() {
      return this._doc.title;
    }
    setTitle(n) {
      this._doc.title = n || "";
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)(R(Re));
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
    }
  }
  return e;
})();
var P = "primary",
  ko = Symbol("RouteTitle"),
  Xl = class {
    constructor(t) {
      this.params = t || {};
    }
    has(t) {
      return Object.prototype.hasOwnProperty.call(this.params, t);
    }
    get(t) {
      if (this.has(t)) {
        let n = this.params[t];
        return Array.isArray(n) ? n[0] : n;
      }
      return null;
    }
    getAll(t) {
      if (this.has(t)) {
        let n = this.params[t];
        return Array.isArray(n) ? n : [n];
      }
      return [];
    }
    get keys() {
      return Object.keys(this.params);
    }
  };
function Ar(e) {
  return new Xl(e);
}
function A_(e, t, n) {
  let r = n.path.split("/");
  if (
    r.length > e.length ||
    (n.pathMatch === "full" && (t.hasChildren() || r.length < e.length))
  )
    return null;
  let o = {};
  for (let i = 0; i < r.length; i++) {
    let s = r[i],
      l = e[i];
    if (s[0] === ":") o[s.substring(1)] = l;
    else if (s !== l.path) return null;
  }
  return { consumed: e.slice(0, r.length), posParams: o };
}
function N_(e, t) {
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; ++n) if (!yt(e[n], t[n])) return !1;
  return !0;
}
function yt(e, t) {
  let n = e ? Jl(e) : void 0,
    r = t ? Jl(t) : void 0;
  if (!n || !r || n.length != r.length) return !1;
  let o;
  for (let i = 0; i < n.length; i++)
    if (((o = n[i]), !dm(e[o], t[o]))) return !1;
  return !0;
}
function Jl(e) {
  return [...Object.keys(e), ...Object.getOwnPropertySymbols(e)];
}
function dm(e, t) {
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    let n = [...e].sort(),
      r = [...t].sort();
    return n.every((o, i) => r[i] === o);
  } else return e === t;
}
function fm(e) {
  return e.length > 0 ? e[e.length - 1] : null;
}
function sn(e) {
  return Ya(e) ? e : Sn(e) ? oe(Promise.resolve(e)) : T(e);
}
var R_ = { exact: pm, subset: gm },
  hm = { exact: O_, subset: P_, ignored: () => !0 };
function rm(e, t, n) {
  return (
    R_[n.paths](e.root, t.root, n.matrixParams) &&
    hm[n.queryParams](e.queryParams, t.queryParams) &&
    !(n.fragment === "exact" && e.fragment !== t.fragment)
  );
}
function O_(e, t) {
  return yt(e, t);
}
function pm(e, t, n) {
  if (
    !An(e.segments, t.segments) ||
    !$s(e.segments, t.segments, n) ||
    e.numberOfChildren !== t.numberOfChildren
  )
    return !1;
  for (let r in t.children)
    if (!e.children[r] || !pm(e.children[r], t.children[r], n)) return !1;
  return !0;
}
function P_(e, t) {
  return (
    Object.keys(t).length <= Object.keys(e).length &&
    Object.keys(t).every((n) => dm(e[n], t[n]))
  );
}
function gm(e, t, n) {
  return mm(e, t, t.segments, n);
}
function mm(e, t, n, r) {
  if (e.segments.length > n.length) {
    let o = e.segments.slice(0, n.length);
    return !(!An(o, n) || t.hasChildren() || !$s(o, n, r));
  } else if (e.segments.length === n.length) {
    if (!An(e.segments, n) || !$s(e.segments, n, r)) return !1;
    for (let o in t.children)
      if (!e.children[o] || !gm(e.children[o], t.children[o], r)) return !1;
    return !0;
  } else {
    let o = n.slice(0, e.segments.length),
      i = n.slice(e.segments.length);
    return !An(e.segments, o) || !$s(e.segments, o, r) || !e.children[P]
      ? !1
      : mm(e.children[P], t, i, r);
  }
}
function $s(e, t, n) {
  return t.every((r, o) => hm[n](e[o].parameters, r.parameters));
}
var Nt = class {
    constructor(t = new Z([], {}), n = {}, r = null) {
      (this.root = t), (this.queryParams = n), (this.fragment = r);
    }
    get queryParamMap() {
      return (
        (this._queryParamMap ??= Ar(this.queryParams)), this._queryParamMap
      );
    }
    toString() {
      return L_.serialize(this);
    }
  },
  Z = class {
    constructor(t, n) {
      (this.segments = t),
        (this.children = n),
        (this.parent = null),
        Object.values(n).forEach((r) => (r.parent = this));
    }
    hasChildren() {
      return this.numberOfChildren > 0;
    }
    get numberOfChildren() {
      return Object.keys(this.children).length;
    }
    toString() {
      return Hs(this);
    }
  },
  Tn = class {
    constructor(t, n) {
      (this.path = t), (this.parameters = n);
    }
    get parameterMap() {
      return (this._parameterMap ??= Ar(this.parameters)), this._parameterMap;
    }
    toString() {
      return ym(this);
    }
  };
function F_(e, t) {
  return An(e, t) && e.every((n, r) => yt(n.parameters, t[r].parameters));
}
function An(e, t) {
  return e.length !== t.length ? !1 : e.every((n, r) => n.path === t[r].path);
}
function k_(e, t) {
  let n = [];
  return (
    Object.entries(e.children).forEach(([r, o]) => {
      r === P && (n = n.concat(t(o, r)));
    }),
    Object.entries(e.children).forEach(([r, o]) => {
      r !== P && (n = n.concat(t(o, r)));
    }),
    n
  );
}
var _u = (() => {
    class e {
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({
          token: e,
          factory: () => new So(),
          providedIn: "root",
        });
      }
    }
    return e;
  })(),
  So = class {
    parse(t) {
      let n = new tu(t);
      return new Nt(
        n.parseRootSegment(),
        n.parseQueryParams(),
        n.parseFragment()
      );
    }
    serialize(t) {
      let n = `/${bo(t.root, !0)}`,
        r = B_(t.queryParams),
        o = typeof t.fragment == "string" ? `#${V_(t.fragment)}` : "";
      return `${n}${r}${o}`;
    }
  },
  L_ = new So();
function Hs(e) {
  return e.segments.map((t) => ym(t)).join("/");
}
function bo(e, t) {
  if (!e.hasChildren()) return Hs(e);
  if (t) {
    let n = e.children[P] ? bo(e.children[P], !1) : "",
      r = [];
    return (
      Object.entries(e.children).forEach(([o, i]) => {
        o !== P && r.push(`${o}:${bo(i, !1)}`);
      }),
      r.length > 0 ? `${n}(${r.join("//")})` : n
    );
  } else {
    let n = k_(e, (r, o) =>
      o === P ? [bo(e.children[P], !1)] : [`${o}:${bo(r, !1)}`]
    );
    return Object.keys(e.children).length === 1 && e.children[P] != null
      ? `${Hs(e)}/${n[0]}`
      : `${Hs(e)}/(${n.join("//")})`;
  }
}
function vm(e) {
  return encodeURIComponent(e)
    .replace(/%40/g, "@")
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",");
}
function Bs(e) {
  return vm(e).replace(/%3B/gi, ";");
}
function V_(e) {
  return encodeURI(e);
}
function eu(e) {
  return vm(e)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/%26/gi, "&");
}
function zs(e) {
  return decodeURIComponent(e);
}
function om(e) {
  return zs(e.replace(/\+/g, "%20"));
}
function ym(e) {
  return `${eu(e.path)}${j_(e.parameters)}`;
}
function j_(e) {
  return Object.entries(e)
    .map(([t, n]) => `;${eu(t)}=${eu(n)}`)
    .join("");
}
function B_(e) {
  let t = Object.entries(e)
    .map(([n, r]) =>
      Array.isArray(r)
        ? r.map((o) => `${Bs(n)}=${Bs(o)}`).join("&")
        : `${Bs(n)}=${Bs(r)}`
    )
    .filter((n) => n);
  return t.length ? `?${t.join("&")}` : "";
}
var U_ = /^[^\/()?;#]+/;
function Zl(e) {
  let t = e.match(U_);
  return t ? t[0] : "";
}
var $_ = /^[^\/()?;=#]+/;
function H_(e) {
  let t = e.match($_);
  return t ? t[0] : "";
}
var z_ = /^[^=?&#]+/;
function G_(e) {
  let t = e.match(z_);
  return t ? t[0] : "";
}
var q_ = /^[^&#]+/;
function W_(e) {
  let t = e.match(q_);
  return t ? t[0] : "";
}
var tu = class {
  constructor(t) {
    (this.url = t), (this.remaining = t);
  }
  parseRootSegment() {
    return (
      this.consumeOptional("/"),
      this.remaining === "" ||
      this.peekStartsWith("?") ||
      this.peekStartsWith("#")
        ? new Z([], {})
        : new Z([], this.parseChildren())
    );
  }
  parseQueryParams() {
    let t = {};
    if (this.consumeOptional("?"))
      do this.parseQueryParam(t);
      while (this.consumeOptional("&"));
    return t;
  }
  parseFragment() {
    return this.consumeOptional("#")
      ? decodeURIComponent(this.remaining)
      : null;
  }
  parseChildren() {
    if (this.remaining === "") return {};
    this.consumeOptional("/");
    let t = [];
    for (
      this.peekStartsWith("(") || t.push(this.parseSegment());
      this.peekStartsWith("/") &&
      !this.peekStartsWith("//") &&
      !this.peekStartsWith("/(");

    )
      this.capture("/"), t.push(this.parseSegment());
    let n = {};
    this.peekStartsWith("/(") &&
      (this.capture("/"), (n = this.parseParens(!0)));
    let r = {};
    return (
      this.peekStartsWith("(") && (r = this.parseParens(!1)),
      (t.length > 0 || Object.keys(n).length > 0) && (r[P] = new Z(t, n)),
      r
    );
  }
  parseSegment() {
    let t = Zl(this.remaining);
    if (t === "" && this.peekStartsWith(";")) throw new _(4009, !1);
    return this.capture(t), new Tn(zs(t), this.parseMatrixParams());
  }
  parseMatrixParams() {
    let t = {};
    for (; this.consumeOptional(";"); ) this.parseParam(t);
    return t;
  }
  parseParam(t) {
    let n = H_(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = "";
    if (this.consumeOptional("=")) {
      let o = Zl(this.remaining);
      o && ((r = o), this.capture(r));
    }
    t[zs(n)] = zs(r);
  }
  parseQueryParam(t) {
    let n = G_(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = "";
    if (this.consumeOptional("=")) {
      let s = W_(this.remaining);
      s && ((r = s), this.capture(r));
    }
    let o = om(n),
      i = om(r);
    if (t.hasOwnProperty(o)) {
      let s = t[o];
      Array.isArray(s) || ((s = [s]), (t[o] = s)), s.push(i);
    } else t[o] = i;
  }
  parseParens(t) {
    let n = {};
    for (
      this.capture("(");
      !this.consumeOptional(")") && this.remaining.length > 0;

    ) {
      let r = Zl(this.remaining),
        o = this.remaining[r.length];
      if (o !== "/" && o !== ")" && o !== ";") throw new _(4010, !1);
      let i;
      r.indexOf(":") > -1
        ? ((i = r.slice(0, r.indexOf(":"))), this.capture(i), this.capture(":"))
        : t && (i = P);
      let s = this.parseChildren();
      (n[i] = Object.keys(s).length === 1 ? s[P] : new Z([], s)),
        this.consumeOptional("//");
    }
    return n;
  }
  peekStartsWith(t) {
    return this.remaining.startsWith(t);
  }
  consumeOptional(t) {
    return this.peekStartsWith(t)
      ? ((this.remaining = this.remaining.substring(t.length)), !0)
      : !1;
  }
  capture(t) {
    if (!this.consumeOptional(t)) throw new _(4011, !1);
  }
};
function wm(e) {
  return e.segments.length > 0 ? new Z([], { [P]: e }) : e;
}
function Dm(e) {
  let t = {};
  for (let [r, o] of Object.entries(e.children)) {
    let i = Dm(o);
    if (r === P && i.segments.length === 0 && i.hasChildren())
      for (let [s, l] of Object.entries(i.children)) t[s] = l;
    else (i.segments.length > 0 || i.hasChildren()) && (t[r] = i);
  }
  let n = new Z(e.segments, t);
  return Z_(n);
}
function Z_(e) {
  if (e.numberOfChildren === 1 && e.children[P]) {
    let t = e.children[P];
    return new Z(e.segments.concat(t.segments), t.children);
  }
  return e;
}
function Nn(e) {
  return e instanceof Nt;
}
function Y_(e, t, n = null, r = null) {
  let o = bm(e);
  return Cm(o, t, n, r);
}
function bm(e) {
  let t;
  function n(i) {
    let s = {};
    for (let u of i.children) {
      let f = n(u);
      s[u.outlet] = f;
    }
    let l = new Z(i.url, s);
    return i === e && (t = l), l;
  }
  let r = n(e.root),
    o = wm(r);
  return t ?? o;
}
function Cm(e, t, n, r) {
  let o = e;
  for (; o.parent; ) o = o.parent;
  if (t.length === 0) return Yl(o, o, o, n, r);
  let i = Q_(t);
  if (i.toRoot()) return Yl(o, o, new Z([], {}), n, r);
  let s = K_(i, o, e),
    l = s.processChildren
      ? Io(s.segmentGroup, s.index, i.commands)
      : Im(s.segmentGroup, s.index, i.commands);
  return Yl(o, s.segmentGroup, l, n, r);
}
function Gs(e) {
  return typeof e == "object" && e != null && !e.outlets && !e.segmentPath;
}
function xo(e) {
  return typeof e == "object" && e != null && e.outlets;
}
function Yl(e, t, n, r, o) {
  let i = {};
  r &&
    Object.entries(r).forEach(([u, f]) => {
      i[u] = Array.isArray(f) ? f.map((g) => `${g}`) : `${f}`;
    });
  let s;
  e === t ? (s = n) : (s = Em(e, t, n));
  let l = wm(Dm(s));
  return new Nt(l, i, o);
}
function Em(e, t, n) {
  let r = {};
  return (
    Object.entries(e.children).forEach(([o, i]) => {
      i === t ? (r[o] = n) : (r[o] = Em(i, t, n));
    }),
    new Z(e.segments, r)
  );
}
var qs = class {
  constructor(t, n, r) {
    if (
      ((this.isAbsolute = t),
      (this.numberOfDoubleDots = n),
      (this.commands = r),
      t && r.length > 0 && Gs(r[0]))
    )
      throw new _(4003, !1);
    let o = r.find(xo);
    if (o && o !== fm(r)) throw new _(4004, !1);
  }
  toRoot() {
    return (
      this.isAbsolute && this.commands.length === 1 && this.commands[0] == "/"
    );
  }
};
function Q_(e) {
  if (typeof e[0] == "string" && e.length === 1 && e[0] === "/")
    return new qs(!0, 0, e);
  let t = 0,
    n = !1,
    r = e.reduce((o, i, s) => {
      if (typeof i == "object" && i != null) {
        if (i.outlets) {
          let l = {};
          return (
            Object.entries(i.outlets).forEach(([u, f]) => {
              l[u] = typeof f == "string" ? f.split("/") : f;
            }),
            [...o, { outlets: l }]
          );
        }
        if (i.segmentPath) return [...o, i.segmentPath];
      }
      return typeof i != "string"
        ? [...o, i]
        : s === 0
        ? (i.split("/").forEach((l, u) => {
            (u == 0 && l === ".") ||
              (u == 0 && l === ""
                ? (n = !0)
                : l === ".."
                ? t++
                : l != "" && o.push(l));
          }),
          o)
        : [...o, i];
    }, []);
  return new qs(n, t, r);
}
var Sr = class {
  constructor(t, n, r) {
    (this.segmentGroup = t), (this.processChildren = n), (this.index = r);
  }
};
function K_(e, t, n) {
  if (e.isAbsolute) return new Sr(t, !0, 0);
  if (!n) return new Sr(t, !1, NaN);
  if (n.parent === null) return new Sr(n, !0, 0);
  let r = Gs(e.commands[0]) ? 0 : 1,
    o = n.segments.length - 1 + r;
  return X_(n, o, e.numberOfDoubleDots);
}
function X_(e, t, n) {
  let r = e,
    o = t,
    i = n;
  for (; i > o; ) {
    if (((i -= o), (r = r.parent), !r)) throw new _(4005, !1);
    o = r.segments.length;
  }
  return new Sr(r, !1, o - i);
}
function J_(e) {
  return xo(e[0]) ? e[0].outlets : { [P]: e };
}
function Im(e, t, n) {
  if (((e ??= new Z([], {})), e.segments.length === 0 && e.hasChildren()))
    return Io(e, t, n);
  let r = eM(e, t, n),
    o = n.slice(r.commandIndex);
  if (r.match && r.pathIndex < e.segments.length) {
    let i = new Z(e.segments.slice(0, r.pathIndex), {});
    return (
      (i.children[P] = new Z(e.segments.slice(r.pathIndex), e.children)),
      Io(i, 0, o)
    );
  } else
    return r.match && o.length === 0
      ? new Z(e.segments, {})
      : r.match && !e.hasChildren()
      ? nu(e, t, n)
      : r.match
      ? Io(e, 0, o)
      : nu(e, t, n);
}
function Io(e, t, n) {
  if (n.length === 0) return new Z(e.segments, {});
  {
    let r = J_(n),
      o = {};
    if (
      Object.keys(r).some((i) => i !== P) &&
      e.children[P] &&
      e.numberOfChildren === 1 &&
      e.children[P].segments.length === 0
    ) {
      let i = Io(e.children[P], t, n);
      return new Z(e.segments, i.children);
    }
    return (
      Object.entries(r).forEach(([i, s]) => {
        typeof s == "string" && (s = [s]),
          s !== null && (o[i] = Im(e.children[i], t, s));
      }),
      Object.entries(e.children).forEach(([i, s]) => {
        r[i] === void 0 && (o[i] = s);
      }),
      new Z(e.segments, o)
    );
  }
}
function eM(e, t, n) {
  let r = 0,
    o = t,
    i = { match: !1, pathIndex: 0, commandIndex: 0 };
  for (; o < e.segments.length; ) {
    if (r >= n.length) return i;
    let s = e.segments[o],
      l = n[r];
    if (xo(l)) break;
    let u = `${l}`,
      f = r < n.length - 1 ? n[r + 1] : null;
    if (o > 0 && u === void 0) break;
    if (u && f && typeof f == "object" && f.outlets === void 0) {
      if (!sm(u, f, s)) return i;
      r += 2;
    } else {
      if (!sm(u, {}, s)) return i;
      r++;
    }
    o++;
  }
  return { match: !0, pathIndex: o, commandIndex: r };
}
function nu(e, t, n) {
  let r = e.segments.slice(0, t),
    o = 0;
  for (; o < n.length; ) {
    let i = n[o];
    if (xo(i)) {
      let u = tM(i.outlets);
      return new Z(r, u);
    }
    if (o === 0 && Gs(n[0])) {
      let u = e.segments[t];
      r.push(new Tn(u.path, im(n[0]))), o++;
      continue;
    }
    let s = xo(i) ? i.outlets[P] : `${i}`,
      l = o < n.length - 1 ? n[o + 1] : null;
    s && l && Gs(l)
      ? (r.push(new Tn(s, im(l))), (o += 2))
      : (r.push(new Tn(s, {})), o++);
  }
  return new Z(r, {});
}
function tM(e) {
  let t = {};
  return (
    Object.entries(e).forEach(([n, r]) => {
      typeof r == "string" && (r = [r]),
        r !== null && (t[n] = nu(new Z([], {}), 0, r));
    }),
    t
  );
}
function im(e) {
  let t = {};
  return Object.entries(e).forEach(([n, r]) => (t[n] = `${r}`)), t;
}
function sm(e, t, n) {
  return e == n.path && yt(t, n.parameters);
}
var _o = "imperative",
  De = (function (e) {
    return (
      (e[(e.NavigationStart = 0)] = "NavigationStart"),
      (e[(e.NavigationEnd = 1)] = "NavigationEnd"),
      (e[(e.NavigationCancel = 2)] = "NavigationCancel"),
      (e[(e.NavigationError = 3)] = "NavigationError"),
      (e[(e.RoutesRecognized = 4)] = "RoutesRecognized"),
      (e[(e.ResolveStart = 5)] = "ResolveStart"),
      (e[(e.ResolveEnd = 6)] = "ResolveEnd"),
      (e[(e.GuardsCheckStart = 7)] = "GuardsCheckStart"),
      (e[(e.GuardsCheckEnd = 8)] = "GuardsCheckEnd"),
      (e[(e.RouteConfigLoadStart = 9)] = "RouteConfigLoadStart"),
      (e[(e.RouteConfigLoadEnd = 10)] = "RouteConfigLoadEnd"),
      (e[(e.ChildActivationStart = 11)] = "ChildActivationStart"),
      (e[(e.ChildActivationEnd = 12)] = "ChildActivationEnd"),
      (e[(e.ActivationStart = 13)] = "ActivationStart"),
      (e[(e.ActivationEnd = 14)] = "ActivationEnd"),
      (e[(e.Scroll = 15)] = "Scroll"),
      (e[(e.NavigationSkipped = 16)] = "NavigationSkipped"),
      e
    );
  })(De || {}),
  Qe = class {
    constructor(t, n) {
      (this.id = t), (this.url = n);
    }
  },
  To = class extends Qe {
    constructor(t, n, r = "imperative", o = null) {
      super(t, n),
        (this.type = De.NavigationStart),
        (this.navigationTrigger = r),
        (this.restoredState = o);
    }
    toString() {
      return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
    }
  },
  on = class extends Qe {
    constructor(t, n, r) {
      super(t, n), (this.urlAfterRedirects = r), (this.type = De.NavigationEnd);
    }
    toString() {
      return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
    }
  },
  $e = (function (e) {
    return (
      (e[(e.Redirect = 0)] = "Redirect"),
      (e[(e.SupersededByNewNavigation = 1)] = "SupersededByNewNavigation"),
      (e[(e.NoDataFromResolver = 2)] = "NoDataFromResolver"),
      (e[(e.GuardRejected = 3)] = "GuardRejected"),
      e
    );
  })($e || {}),
  ru = (function (e) {
    return (
      (e[(e.IgnoredSameUrlNavigation = 0)] = "IgnoredSameUrlNavigation"),
      (e[(e.IgnoredByUrlHandlingStrategy = 1)] =
        "IgnoredByUrlHandlingStrategy"),
      e
    );
  })(ru || {}),
  At = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.reason = r),
        (this.code = o),
        (this.type = De.NavigationCancel);
    }
    toString() {
      return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
    }
  },
  Rn = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.reason = r),
        (this.code = o),
        (this.type = De.NavigationSkipped);
    }
  },
  Ao = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.error = r),
        (this.target = o),
        (this.type = De.NavigationError);
    }
    toString() {
      return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
    }
  },
  Ws = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.urlAfterRedirects = r),
        (this.state = o),
        (this.type = De.RoutesRecognized);
    }
    toString() {
      return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  ou = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.urlAfterRedirects = r),
        (this.state = o),
        (this.type = De.GuardsCheckStart);
    }
    toString() {
      return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  iu = class extends Qe {
    constructor(t, n, r, o, i) {
      super(t, n),
        (this.urlAfterRedirects = r),
        (this.state = o),
        (this.shouldActivate = i),
        (this.type = De.GuardsCheckEnd);
    }
    toString() {
      return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
    }
  },
  su = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.urlAfterRedirects = r),
        (this.state = o),
        (this.type = De.ResolveStart);
    }
    toString() {
      return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  au = class extends Qe {
    constructor(t, n, r, o) {
      super(t, n),
        (this.urlAfterRedirects = r),
        (this.state = o),
        (this.type = De.ResolveEnd);
    }
    toString() {
      return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
    }
  },
  cu = class {
    constructor(t) {
      (this.route = t), (this.type = De.RouteConfigLoadStart);
    }
    toString() {
      return `RouteConfigLoadStart(path: ${this.route.path})`;
    }
  },
  lu = class {
    constructor(t) {
      (this.route = t), (this.type = De.RouteConfigLoadEnd);
    }
    toString() {
      return `RouteConfigLoadEnd(path: ${this.route.path})`;
    }
  },
  uu = class {
    constructor(t) {
      (this.snapshot = t), (this.type = De.ChildActivationStart);
    }
    toString() {
      return `ChildActivationStart(path: '${
        (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ""
      }')`;
    }
  },
  du = class {
    constructor(t) {
      (this.snapshot = t), (this.type = De.ChildActivationEnd);
    }
    toString() {
      return `ChildActivationEnd(path: '${
        (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ""
      }')`;
    }
  },
  fu = class {
    constructor(t) {
      (this.snapshot = t), (this.type = De.ActivationStart);
    }
    toString() {
      return `ActivationStart(path: '${
        (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ""
      }')`;
    }
  },
  hu = class {
    constructor(t) {
      (this.snapshot = t), (this.type = De.ActivationEnd);
    }
    toString() {
      return `ActivationEnd(path: '${
        (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ""
      }')`;
    }
  };
var No = class {},
  Nr = class {
    constructor(t, n) {
      (this.url = t), (this.navigationBehaviorOptions = n);
    }
  };
function nM(e, t) {
  return (
    e.providers &&
      !e._injector &&
      (e._injector = Tl(e.providers, t, `Route: ${e.path}`)),
    e._injector ?? t
  );
}
function st(e) {
  return e.outlet || P;
}
function rM(e, t) {
  let n = e.filter((r) => st(r) === t);
  return n.push(...e.filter((r) => st(r) !== t)), n;
}
function Lo(e) {
  if (!e) return null;
  if (e.routeConfig?._injector) return e.routeConfig._injector;
  for (let t = e.parent; t; t = t.parent) {
    let n = t.routeConfig;
    if (n?._loadedInjector) return n._loadedInjector;
    if (n?._injector) return n._injector;
  }
  return null;
}
var pu = class {
    get injector() {
      return Lo(this.route?.snapshot) ?? this.rootInjector;
    }
    set injector(t) {}
    constructor(t) {
      (this.rootInjector = t),
        (this.outlet = null),
        (this.route = null),
        (this.children = new ea(this.rootInjector)),
        (this.attachRef = null);
    }
  },
  ea = (() => {
    class e {
      constructor(n) {
        (this.rootInjector = n), (this.contexts = new Map());
      }
      onChildOutletCreated(n, r) {
        let o = this.getOrCreateContext(n);
        (o.outlet = r), this.contexts.set(n, o);
      }
      onChildOutletDestroyed(n) {
        let r = this.getContext(n);
        r && ((r.outlet = null), (r.attachRef = null));
      }
      onOutletDeactivated() {
        let n = this.contexts;
        return (this.contexts = new Map()), n;
      }
      onOutletReAttached(n) {
        this.contexts = n;
      }
      getOrCreateContext(n) {
        let r = this.getContext(n);
        return (
          r || ((r = new pu(this.rootInjector)), this.contexts.set(n, r)), r
        );
      }
      getContext(n) {
        return this.contexts.get(n) || null;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(Ne));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  Zs = class {
    constructor(t) {
      this._root = t;
    }
    get root() {
      return this._root.value;
    }
    parent(t) {
      let n = this.pathFromRoot(t);
      return n.length > 1 ? n[n.length - 2] : null;
    }
    children(t) {
      let n = gu(t, this._root);
      return n ? n.children.map((r) => r.value) : [];
    }
    firstChild(t) {
      let n = gu(t, this._root);
      return n && n.children.length > 0 ? n.children[0].value : null;
    }
    siblings(t) {
      let n = mu(t, this._root);
      return n.length < 2
        ? []
        : n[n.length - 2].children.map((o) => o.value).filter((o) => o !== t);
    }
    pathFromRoot(t) {
      return mu(t, this._root).map((n) => n.value);
    }
  };
function gu(e, t) {
  if (e === t.value) return t;
  for (let n of t.children) {
    let r = gu(e, n);
    if (r) return r;
  }
  return null;
}
function mu(e, t) {
  if (e === t.value) return [t];
  for (let n of t.children) {
    let r = mu(e, n);
    if (r.length) return r.unshift(t), r;
  }
  return [];
}
var Ue = class {
  constructor(t, n) {
    (this.value = t), (this.children = n);
  }
  toString() {
    return `TreeNode(${this.value})`;
  }
};
function Mr(e) {
  let t = {};
  return e && e.children.forEach((n) => (t[n.value.outlet] = n)), t;
}
var Ys = class extends Zs {
  constructor(t, n) {
    super(t), (this.snapshot = n), Mu(this, t);
  }
  toString() {
    return this.snapshot.toString();
  }
};
function _m(e) {
  let t = oM(e),
    n = new we([new Tn("", {})]),
    r = new we({}),
    o = new we({}),
    i = new we({}),
    s = new we(""),
    l = new On(n, r, i, s, o, P, e, t.root);
  return (l.snapshot = t.root), new Ys(new Ue(l, []), t);
}
function oM(e) {
  let t = {},
    n = {},
    r = {},
    o = "",
    i = new xr([], t, r, o, n, P, e, null, {});
  return new Ks("", new Ue(i, []));
}
var On = class {
  constructor(t, n, r, o, i, s, l, u) {
    (this.urlSubject = t),
      (this.paramsSubject = n),
      (this.queryParamsSubject = r),
      (this.fragmentSubject = o),
      (this.dataSubject = i),
      (this.outlet = s),
      (this.component = l),
      (this._futureSnapshot = u),
      (this.title = this.dataSubject?.pipe(O((f) => f[ko])) ?? T(void 0)),
      (this.url = t),
      (this.params = n),
      (this.queryParams = r),
      (this.fragment = o),
      (this.data = i);
  }
  get routeConfig() {
    return this._futureSnapshot.routeConfig;
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return (
      (this._paramMap ??= this.params.pipe(O((t) => Ar(t)))), this._paramMap
    );
  }
  get queryParamMap() {
    return (
      (this._queryParamMap ??= this.queryParams.pipe(O((t) => Ar(t)))),
      this._queryParamMap
    );
  }
  toString() {
    return this.snapshot
      ? this.snapshot.toString()
      : `Future(${this._futureSnapshot})`;
  }
};
function Qs(e, t, n = "emptyOnly") {
  let r,
    { routeConfig: o } = e;
  return (
    t !== null &&
    (n === "always" ||
      o?.path === "" ||
      (!t.component && !t.routeConfig?.loadComponent))
      ? (r = {
          params: b(b({}, t.params), e.params),
          data: b(b({}, t.data), e.data),
          resolve: b(b(b(b({}, e.data), t.data), o?.data), e._resolvedData),
        })
      : (r = {
          params: b({}, e.params),
          data: b({}, e.data),
          resolve: b(b({}, e.data), e._resolvedData ?? {}),
        }),
    o && Sm(o) && (r.resolve[ko] = o.title),
    r
  );
}
var xr = class {
    get title() {
      return this.data?.[ko];
    }
    constructor(t, n, r, o, i, s, l, u, f) {
      (this.url = t),
        (this.params = n),
        (this.queryParams = r),
        (this.fragment = o),
        (this.data = i),
        (this.outlet = s),
        (this.component = l),
        (this.routeConfig = u),
        (this._resolve = f);
    }
    get root() {
      return this._routerState.root;
    }
    get parent() {
      return this._routerState.parent(this);
    }
    get firstChild() {
      return this._routerState.firstChild(this);
    }
    get children() {
      return this._routerState.children(this);
    }
    get pathFromRoot() {
      return this._routerState.pathFromRoot(this);
    }
    get paramMap() {
      return (this._paramMap ??= Ar(this.params)), this._paramMap;
    }
    get queryParamMap() {
      return (
        (this._queryParamMap ??= Ar(this.queryParams)), this._queryParamMap
      );
    }
    toString() {
      let t = this.url.map((r) => r.toString()).join("/"),
        n = this.routeConfig ? this.routeConfig.path : "";
      return `Route(url:'${t}', path:'${n}')`;
    }
  },
  Ks = class extends Zs {
    constructor(t, n) {
      super(n), (this.url = t), Mu(this, n);
    }
    toString() {
      return Mm(this._root);
    }
  };
function Mu(e, t) {
  (t.value._routerState = e), t.children.forEach((n) => Mu(e, n));
}
function Mm(e) {
  let t = e.children.length > 0 ? ` { ${e.children.map(Mm).join(", ")} } ` : "";
  return `${e.value}${t}`;
}
function Ql(e) {
  if (e.snapshot) {
    let t = e.snapshot,
      n = e._futureSnapshot;
    (e.snapshot = n),
      yt(t.queryParams, n.queryParams) ||
        e.queryParamsSubject.next(n.queryParams),
      t.fragment !== n.fragment && e.fragmentSubject.next(n.fragment),
      yt(t.params, n.params) || e.paramsSubject.next(n.params),
      N_(t.url, n.url) || e.urlSubject.next(n.url),
      yt(t.data, n.data) || e.dataSubject.next(n.data);
  } else
    (e.snapshot = e._futureSnapshot),
      e.dataSubject.next(e._futureSnapshot.data);
}
function vu(e, t) {
  let n = yt(e.params, t.params) && F_(e.url, t.url),
    r = !e.parent != !t.parent;
  return n && !r && (!e.parent || vu(e.parent, t.parent));
}
function Sm(e) {
  return typeof e.title == "string" || e.title === null;
}
var Su = (() => {
    class e {
      constructor() {
        (this.activated = null),
          (this._activatedRoute = null),
          (this.name = P),
          (this.activateEvents = new de()),
          (this.deactivateEvents = new de()),
          (this.attachEvents = new de()),
          (this.detachEvents = new de()),
          (this.parentContexts = y(ea)),
          (this.location = y(_s)),
          (this.changeDetector = y(br)),
          (this.inputBinder = y(ta, { optional: !0 })),
          (this.supportsBindingToComponentInputs = !0);
      }
      get activatedComponentRef() {
        return this.activated;
      }
      ngOnChanges(n) {
        if (n.name) {
          let { firstChange: r, previousValue: o } = n.name;
          if (r) return;
          this.isTrackedInParentContexts(o) &&
            (this.deactivate(), this.parentContexts.onChildOutletDestroyed(o)),
            this.initializeOutletWithName();
        }
      }
      ngOnDestroy() {
        this.isTrackedInParentContexts(this.name) &&
          this.parentContexts.onChildOutletDestroyed(this.name),
          this.inputBinder?.unsubscribeFromRouteData(this);
      }
      isTrackedInParentContexts(n) {
        return this.parentContexts.getContext(n)?.outlet === this;
      }
      ngOnInit() {
        this.initializeOutletWithName();
      }
      initializeOutletWithName() {
        if (
          (this.parentContexts.onChildOutletCreated(this.name, this),
          this.activated)
        )
          return;
        let n = this.parentContexts.getContext(this.name);
        n?.route &&
          (n.attachRef
            ? this.attach(n.attachRef, n.route)
            : this.activateWith(n.route, n.injector));
      }
      get isActivated() {
        return !!this.activated;
      }
      get component() {
        if (!this.activated) throw new _(4012, !1);
        return this.activated.instance;
      }
      get activatedRoute() {
        if (!this.activated) throw new _(4012, !1);
        return this._activatedRoute;
      }
      get activatedRouteData() {
        return this._activatedRoute ? this._activatedRoute.snapshot.data : {};
      }
      detach() {
        if (!this.activated) throw new _(4012, !1);
        this.location.detach();
        let n = this.activated;
        return (
          (this.activated = null),
          (this._activatedRoute = null),
          this.detachEvents.emit(n.instance),
          n
        );
      }
      attach(n, r) {
        (this.activated = n),
          (this._activatedRoute = r),
          this.location.insert(n.hostView),
          this.inputBinder?.bindActivatedRouteToOutletComponent(this),
          this.attachEvents.emit(n.instance);
      }
      deactivate() {
        if (this.activated) {
          let n = this.component;
          this.activated.destroy(),
            (this.activated = null),
            (this._activatedRoute = null),
            this.deactivateEvents.emit(n);
        }
      }
      activateWith(n, r) {
        if (this.isActivated) throw new _(4013, !1);
        this._activatedRoute = n;
        let o = this.location,
          s = n.snapshot.component,
          l = this.parentContexts.getOrCreateContext(this.name).children,
          u = new yu(n, l, o.injector);
        (this.activated = o.createComponent(s, {
          index: o.length,
          injector: u,
          environmentInjector: r,
        })),
          this.changeDetector.markForCheck(),
          this.inputBinder?.bindActivatedRouteToOutletComponent(this),
          this.activateEvents.emit(this.activated.instance);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [["router-outlet"]],
          inputs: { name: "name" },
          outputs: {
            activateEvents: "activate",
            deactivateEvents: "deactivate",
            attachEvents: "attach",
            detachEvents: "detach",
          },
          exportAs: ["outlet"],
          standalone: !0,
          features: [Zt],
        });
      }
    }
    return e;
  })(),
  yu = class e {
    __ngOutletInjector(t) {
      return new e(this.route, this.childContexts, t);
    }
    constructor(t, n, r) {
      (this.route = t), (this.childContexts = n), (this.parent = r);
    }
    get(t, n) {
      return t === On
        ? this.route
        : t === ea
        ? this.childContexts
        : this.parent.get(t, n);
    }
  },
  ta = new M(""),
  am = (() => {
    class e {
      constructor() {
        this.outletDataSubscriptions = new Map();
      }
      bindActivatedRouteToOutletComponent(n) {
        this.unsubscribeFromRouteData(n), this.subscribeToRouteData(n);
      }
      unsubscribeFromRouteData(n) {
        this.outletDataSubscriptions.get(n)?.unsubscribe(),
          this.outletDataSubscriptions.delete(n);
      }
      subscribeToRouteData(n) {
        let { activatedRoute: r } = n,
          o = qr([r.queryParams, r.params, r.data])
            .pipe(
              Te(
                ([i, s, l], u) => (
                  (l = b(b(b({}, i), s), l)),
                  u === 0 ? T(l) : Promise.resolve(l)
                )
              )
            )
            .subscribe((i) => {
              if (
                !n.isActivated ||
                !n.activatedComponentRef ||
                n.activatedRoute !== r ||
                r.component === null
              ) {
                this.unsubscribeFromRouteData(n);
                return;
              }
              let s = Mg(r.component);
              if (!s) {
                this.unsubscribeFromRouteData(n);
                return;
              }
              for (let { templateName: l } of s.inputs)
                n.activatedComponentRef.setInput(l, i[l]);
            });
        this.outletDataSubscriptions.set(n, o);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac });
      }
    }
    return e;
  })();
function iM(e, t, n) {
  let r = Ro(e, t._root, n ? n._root : void 0);
  return new Ys(r, t);
}
function Ro(e, t, n) {
  if (n && e.shouldReuseRoute(t.value, n.value.snapshot)) {
    let r = n.value;
    r._futureSnapshot = t.value;
    let o = sM(e, t, n);
    return new Ue(r, o);
  } else {
    if (e.shouldAttach(t.value)) {
      let i = e.retrieve(t.value);
      if (i !== null) {
        let s = i.route;
        return (
          (s.value._futureSnapshot = t.value),
          (s.children = t.children.map((l) => Ro(e, l))),
          s
        );
      }
    }
    let r = aM(t.value),
      o = t.children.map((i) => Ro(e, i));
    return new Ue(r, o);
  }
}
function sM(e, t, n) {
  return t.children.map((r) => {
    for (let o of n.children)
      if (e.shouldReuseRoute(r.value, o.value.snapshot)) return Ro(e, r, o);
    return Ro(e, r);
  });
}
function aM(e) {
  return new On(
    new we(e.url),
    new we(e.params),
    new we(e.queryParams),
    new we(e.fragment),
    new we(e.data),
    e.outlet,
    e.component,
    e
  );
}
var Oo = class {
    constructor(t, n) {
      (this.redirectTo = t), (this.navigationBehaviorOptions = n);
    }
  },
  xm = "ngNavigationCancelingError";
function Xs(e, t) {
  let { redirectTo: n, navigationBehaviorOptions: r } = Nn(t)
      ? { redirectTo: t, navigationBehaviorOptions: void 0 }
      : t,
    o = Tm(!1, $e.Redirect);
  return (o.url = n), (o.navigationBehaviorOptions = r), o;
}
function Tm(e, t) {
  let n = new Error(`NavigationCancelingError: ${e || ""}`);
  return (n[xm] = !0), (n.cancellationCode = t), n;
}
function cM(e) {
  return Am(e) && Nn(e.url);
}
function Am(e) {
  return !!e && e[xm];
}
var lM = (e, t, n, r) =>
    O(
      (o) => (
        new wu(t, o.targetRouterState, o.currentRouterState, n, r).activate(e),
        o
      )
    ),
  wu = class {
    constructor(t, n, r, o, i) {
      (this.routeReuseStrategy = t),
        (this.futureState = n),
        (this.currState = r),
        (this.forwardEvent = o),
        (this.inputBindingEnabled = i);
    }
    activate(t) {
      let n = this.futureState._root,
        r = this.currState ? this.currState._root : null;
      this.deactivateChildRoutes(n, r, t),
        Ql(this.futureState.root),
        this.activateChildRoutes(n, r, t);
    }
    deactivateChildRoutes(t, n, r) {
      let o = Mr(n);
      t.children.forEach((i) => {
        let s = i.value.outlet;
        this.deactivateRoutes(i, o[s], r), delete o[s];
      }),
        Object.values(o).forEach((i) => {
          this.deactivateRouteAndItsChildren(i, r);
        });
    }
    deactivateRoutes(t, n, r) {
      let o = t.value,
        i = n ? n.value : null;
      if (o === i)
        if (o.component) {
          let s = r.getContext(o.outlet);
          s && this.deactivateChildRoutes(t, n, s.children);
        } else this.deactivateChildRoutes(t, n, r);
      else i && this.deactivateRouteAndItsChildren(n, r);
    }
    deactivateRouteAndItsChildren(t, n) {
      t.value.component &&
      this.routeReuseStrategy.shouldDetach(t.value.snapshot)
        ? this.detachAndStoreRouteSubtree(t, n)
        : this.deactivateRouteAndOutlet(t, n);
    }
    detachAndStoreRouteSubtree(t, n) {
      let r = n.getContext(t.value.outlet),
        o = r && t.value.component ? r.children : n,
        i = Mr(t);
      for (let s of Object.values(i)) this.deactivateRouteAndItsChildren(s, o);
      if (r && r.outlet) {
        let s = r.outlet.detach(),
          l = r.children.onOutletDeactivated();
        this.routeReuseStrategy.store(t.value.snapshot, {
          componentRef: s,
          route: t,
          contexts: l,
        });
      }
    }
    deactivateRouteAndOutlet(t, n) {
      let r = n.getContext(t.value.outlet),
        o = r && t.value.component ? r.children : n,
        i = Mr(t);
      for (let s of Object.values(i)) this.deactivateRouteAndItsChildren(s, o);
      r &&
        (r.outlet && (r.outlet.deactivate(), r.children.onOutletDeactivated()),
        (r.attachRef = null),
        (r.route = null));
    }
    activateChildRoutes(t, n, r) {
      let o = Mr(n);
      t.children.forEach((i) => {
        this.activateRoutes(i, o[i.value.outlet], r),
          this.forwardEvent(new hu(i.value.snapshot));
      }),
        t.children.length && this.forwardEvent(new du(t.value.snapshot));
    }
    activateRoutes(t, n, r) {
      let o = t.value,
        i = n ? n.value : null;
      if ((Ql(o), o === i))
        if (o.component) {
          let s = r.getOrCreateContext(o.outlet);
          this.activateChildRoutes(t, n, s.children);
        } else this.activateChildRoutes(t, n, r);
      else if (o.component) {
        let s = r.getOrCreateContext(o.outlet);
        if (this.routeReuseStrategy.shouldAttach(o.snapshot)) {
          let l = this.routeReuseStrategy.retrieve(o.snapshot);
          this.routeReuseStrategy.store(o.snapshot, null),
            s.children.onOutletReAttached(l.contexts),
            (s.attachRef = l.componentRef),
            (s.route = l.route.value),
            s.outlet && s.outlet.attach(l.componentRef, l.route.value),
            Ql(l.route.value),
            this.activateChildRoutes(t, null, s.children);
        } else
          (s.attachRef = null),
            (s.route = o),
            s.outlet && s.outlet.activateWith(o, s.injector),
            this.activateChildRoutes(t, null, s.children);
      } else this.activateChildRoutes(t, null, r);
    }
  },
  Js = class {
    constructor(t) {
      (this.path = t), (this.route = this.path[this.path.length - 1]);
    }
  },
  Tr = class {
    constructor(t, n) {
      (this.component = t), (this.route = n);
    }
  };
function uM(e, t, n) {
  let r = e._root,
    o = t ? t._root : null;
  return Co(r, o, n, [r.value]);
}
function dM(e) {
  let t = e.routeConfig ? e.routeConfig.canActivateChild : null;
  return !t || t.length === 0 ? null : { node: e, guards: t };
}
function Or(e, t) {
  let n = Symbol(),
    r = t.get(e, n);
  return r === n ? (typeof e == "function" && !mh(e) ? e : t.get(e)) : r;
}
function Co(
  e,
  t,
  n,
  r,
  o = { canDeactivateChecks: [], canActivateChecks: [] }
) {
  let i = Mr(t);
  return (
    e.children.forEach((s) => {
      fM(s, i[s.value.outlet], n, r.concat([s.value]), o),
        delete i[s.value.outlet];
    }),
    Object.entries(i).forEach(([s, l]) => Mo(l, n.getContext(s), o)),
    o
  );
}
function fM(
  e,
  t,
  n,
  r,
  o = { canDeactivateChecks: [], canActivateChecks: [] }
) {
  let i = e.value,
    s = t ? t.value : null,
    l = n ? n.getContext(e.value.outlet) : null;
  if (s && i.routeConfig === s.routeConfig) {
    let u = hM(s, i, i.routeConfig.runGuardsAndResolvers);
    u
      ? o.canActivateChecks.push(new Js(r))
      : ((i.data = s.data), (i._resolvedData = s._resolvedData)),
      i.component ? Co(e, t, l ? l.children : null, r, o) : Co(e, t, n, r, o),
      u &&
        l &&
        l.outlet &&
        l.outlet.isActivated &&
        o.canDeactivateChecks.push(new Tr(l.outlet.component, s));
  } else
    s && Mo(t, l, o),
      o.canActivateChecks.push(new Js(r)),
      i.component
        ? Co(e, null, l ? l.children : null, r, o)
        : Co(e, null, n, r, o);
  return o;
}
function hM(e, t, n) {
  if (typeof n == "function") return n(e, t);
  switch (n) {
    case "pathParamsChange":
      return !An(e.url, t.url);
    case "pathParamsOrQueryParamsChange":
      return !An(e.url, t.url) || !yt(e.queryParams, t.queryParams);
    case "always":
      return !0;
    case "paramsOrQueryParamsChange":
      return !vu(e, t) || !yt(e.queryParams, t.queryParams);
    case "paramsChange":
    default:
      return !vu(e, t);
  }
}
function Mo(e, t, n) {
  let r = Mr(e),
    o = e.value;
  Object.entries(r).forEach(([i, s]) => {
    o.component
      ? t
        ? Mo(s, t.children.getContext(i), n)
        : Mo(s, null, n)
      : Mo(s, t, n);
  }),
    o.component
      ? t && t.outlet && t.outlet.isActivated
        ? n.canDeactivateChecks.push(new Tr(t.outlet.component, o))
        : n.canDeactivateChecks.push(new Tr(null, o))
      : n.canDeactivateChecks.push(new Tr(null, o));
}
function Vo(e) {
  return typeof e == "function";
}
function pM(e) {
  return typeof e == "boolean";
}
function gM(e) {
  return e && Vo(e.canLoad);
}
function mM(e) {
  return e && Vo(e.canActivate);
}
function vM(e) {
  return e && Vo(e.canActivateChild);
}
function yM(e) {
  return e && Vo(e.canDeactivate);
}
function wM(e) {
  return e && Vo(e.canMatch);
}
function Nm(e) {
  return e instanceof Je || e?.name === "EmptyError";
}
var Us = Symbol("INITIAL_VALUE");
function Rr() {
  return Te((e) =>
    qr(e.map((t) => t.pipe(bt(1), nc(Us)))).pipe(
      O((t) => {
        for (let n of t)
          if (n !== !0) {
            if (n === Us) return Us;
            if (n === !1 || DM(n)) return n;
          }
        return !0;
      }),
      Ve((t) => t !== Us),
      bt(1)
    )
  );
}
function DM(e) {
  return Nn(e) || e instanceof Oo;
}
function bM(e, t) {
  return ge((n) => {
    let {
      targetSnapshot: r,
      currentSnapshot: o,
      guards: { canActivateChecks: i, canDeactivateChecks: s },
    } = n;
    return s.length === 0 && i.length === 0
      ? T(U(b({}, n), { guardsResult: !0 }))
      : CM(s, r, o, e).pipe(
          ge((l) => (l && pM(l) ? EM(r, i, e, t) : T(l))),
          O((l) => U(b({}, n), { guardsResult: l }))
        );
  });
}
function CM(e, t, n, r) {
  return oe(e).pipe(
    ge((o) => xM(o.component, o.route, n, t, r)),
    lt((o) => o !== !0, !0)
  );
}
function EM(e, t, n, r) {
  return oe(t).pipe(
    Vt((o) =>
      Xn(
        _M(o.route.parent, r),
        IM(o.route, r),
        SM(e, o.path, n),
        MM(e, o.route, n)
      )
    ),
    lt((o) => o !== !0, !0)
  );
}
function IM(e, t) {
  return e !== null && t && t(new fu(e)), T(!0);
}
function _M(e, t) {
  return e !== null && t && t(new uu(e)), T(!0);
}
function MM(e, t, n) {
  let r = t.routeConfig ? t.routeConfig.canActivate : null;
  if (!r || r.length === 0) return T(!0);
  let o = r.map((i) =>
    Ni(() => {
      let s = Lo(t) ?? n,
        l = Or(i, s),
        u = mM(l) ? l.canActivate(t, e) : nt(s, () => l(t, e));
      return sn(u).pipe(lt());
    })
  );
  return T(o).pipe(Rr());
}
function SM(e, t, n) {
  let r = t[t.length - 1],
    i = t
      .slice(0, t.length - 1)
      .reverse()
      .map((s) => dM(s))
      .filter((s) => s !== null)
      .map((s) =>
        Ni(() => {
          let l = s.guards.map((u) => {
            let f = Lo(s.node) ?? n,
              g = Or(u, f),
              h = vM(g) ? g.canActivateChild(r, e) : nt(f, () => g(r, e));
            return sn(h).pipe(lt());
          });
          return T(l).pipe(Rr());
        })
      );
  return T(i).pipe(Rr());
}
function xM(e, t, n, r, o) {
  let i = t && t.routeConfig ? t.routeConfig.canDeactivate : null;
  if (!i || i.length === 0) return T(!0);
  let s = i.map((l) => {
    let u = Lo(t) ?? o,
      f = Or(l, u),
      g = yM(f) ? f.canDeactivate(e, t, n, r) : nt(u, () => f(e, t, n, r));
    return sn(g).pipe(lt());
  });
  return T(s).pipe(Rr());
}
function TM(e, t, n, r) {
  let o = t.canLoad;
  if (o === void 0 || o.length === 0) return T(!0);
  let i = o.map((s) => {
    let l = Or(s, e),
      u = gM(l) ? l.canLoad(t, n) : nt(e, () => l(t, n));
    return sn(u);
  });
  return T(i).pipe(Rr(), Rm(r));
}
function Rm(e) {
  return Ga(
    ye((t) => {
      if (typeof t != "boolean") throw Xs(e, t);
    }),
    O((t) => t === !0)
  );
}
function AM(e, t, n, r) {
  let o = t.canMatch;
  if (!o || o.length === 0) return T(!0);
  let i = o.map((s) => {
    let l = Or(s, e),
      u = wM(l) ? l.canMatch(t, n) : nt(e, () => l(t, n));
    return sn(u);
  });
  return T(i).pipe(Rr(), Rm(r));
}
var Po = class {
    constructor(t) {
      this.segmentGroup = t || null;
    }
  },
  Fo = class extends Error {
    constructor(t) {
      super(), (this.urlTree = t);
    }
  };
function _r(e) {
  return Kn(new Po(e));
}
function NM(e) {
  return Kn(new _(4e3, !1));
}
function RM(e) {
  return Kn(Tm(!1, $e.GuardRejected));
}
var Du = class {
    constructor(t, n) {
      (this.urlSerializer = t), (this.urlTree = n);
    }
    lineralizeSegments(t, n) {
      let r = [],
        o = n.root;
      for (;;) {
        if (((r = r.concat(o.segments)), o.numberOfChildren === 0)) return T(r);
        if (o.numberOfChildren > 1 || !o.children[P])
          return NM(`${t.redirectTo}`);
        o = o.children[P];
      }
    }
    applyRedirectCommands(t, n, r, o, i) {
      if (typeof n != "string") {
        let l = n,
          {
            queryParams: u,
            fragment: f,
            routeConfig: g,
            url: h,
            outlet: w,
            params: v,
            data: D,
            title: I,
          } = o,
          E = nt(i, () =>
            l({
              params: v,
              data: D,
              queryParams: u,
              fragment: f,
              routeConfig: g,
              url: h,
              outlet: w,
              title: I,
            })
          );
        if (E instanceof Nt) throw new Fo(E);
        n = E;
      }
      let s = this.applyRedirectCreateUrlTree(
        n,
        this.urlSerializer.parse(n),
        t,
        r
      );
      if (n[0] === "/") throw new Fo(s);
      return s;
    }
    applyRedirectCreateUrlTree(t, n, r, o) {
      let i = this.createSegmentGroup(t, n.root, r, o);
      return new Nt(
        i,
        this.createQueryParams(n.queryParams, this.urlTree.queryParams),
        n.fragment
      );
    }
    createQueryParams(t, n) {
      let r = {};
      return (
        Object.entries(t).forEach(([o, i]) => {
          if (typeof i == "string" && i[0] === ":") {
            let l = i.substring(1);
            r[o] = n[l];
          } else r[o] = i;
        }),
        r
      );
    }
    createSegmentGroup(t, n, r, o) {
      let i = this.createSegments(t, n.segments, r, o),
        s = {};
      return (
        Object.entries(n.children).forEach(([l, u]) => {
          s[l] = this.createSegmentGroup(t, u, r, o);
        }),
        new Z(i, s)
      );
    }
    createSegments(t, n, r, o) {
      return n.map((i) =>
        i.path[0] === ":" ? this.findPosParam(t, i, o) : this.findOrReturn(i, r)
      );
    }
    findPosParam(t, n, r) {
      let o = r[n.path.substring(1)];
      if (!o) throw new _(4001, !1);
      return o;
    }
    findOrReturn(t, n) {
      let r = 0;
      for (let o of n) {
        if (o.path === t.path) return n.splice(r), o;
        r++;
      }
      return t;
    }
  },
  bu = {
    matched: !1,
    consumedSegments: [],
    remainingSegments: [],
    parameters: {},
    positionalParamSegments: {},
  };
function OM(e, t, n, r, o) {
  let i = Om(e, t, n);
  return i.matched
    ? ((r = nM(t, r)),
      AM(r, t, n, o).pipe(O((s) => (s === !0 ? i : b({}, bu)))))
    : T(i);
}
function Om(e, t, n) {
  if (t.path === "**") return PM(n);
  if (t.path === "")
    return t.pathMatch === "full" && (e.hasChildren() || n.length > 0)
      ? b({}, bu)
      : {
          matched: !0,
          consumedSegments: [],
          remainingSegments: n,
          parameters: {},
          positionalParamSegments: {},
        };
  let o = (t.matcher || A_)(n, e, t);
  if (!o) return b({}, bu);
  let i = {};
  Object.entries(o.posParams ?? {}).forEach(([l, u]) => {
    i[l] = u.path;
  });
  let s =
    o.consumed.length > 0
      ? b(b({}, i), o.consumed[o.consumed.length - 1].parameters)
      : i;
  return {
    matched: !0,
    consumedSegments: o.consumed,
    remainingSegments: n.slice(o.consumed.length),
    parameters: s,
    positionalParamSegments: o.posParams ?? {},
  };
}
function PM(e) {
  return {
    matched: !0,
    parameters: e.length > 0 ? fm(e).parameters : {},
    consumedSegments: e,
    remainingSegments: [],
    positionalParamSegments: {},
  };
}
function cm(e, t, n, r) {
  return n.length > 0 && LM(e, n, r)
    ? {
        segmentGroup: new Z(t, kM(r, new Z(n, e.children))),
        slicedSegments: [],
      }
    : n.length === 0 && VM(e, n, r)
    ? {
        segmentGroup: new Z(e.segments, FM(e, n, r, e.children)),
        slicedSegments: n,
      }
    : { segmentGroup: new Z(e.segments, e.children), slicedSegments: n };
}
function FM(e, t, n, r) {
  let o = {};
  for (let i of n)
    if (na(e, t, i) && !r[st(i)]) {
      let s = new Z([], {});
      o[st(i)] = s;
    }
  return b(b({}, r), o);
}
function kM(e, t) {
  let n = {};
  n[P] = t;
  for (let r of e)
    if (r.path === "" && st(r) !== P) {
      let o = new Z([], {});
      n[st(r)] = o;
    }
  return n;
}
function LM(e, t, n) {
  return n.some((r) => na(e, t, r) && st(r) !== P);
}
function VM(e, t, n) {
  return n.some((r) => na(e, t, r));
}
function na(e, t, n) {
  return (e.hasChildren() || t.length > 0) && n.pathMatch === "full"
    ? !1
    : n.path === "";
}
function jM(e, t, n) {
  return t.length === 0 && !e.children[n];
}
var Cu = class {};
function BM(e, t, n, r, o, i, s = "emptyOnly") {
  return new Eu(e, t, n, r, o, s, i).recognize();
}
var UM = 31,
  Eu = class {
    constructor(t, n, r, o, i, s, l) {
      (this.injector = t),
        (this.configLoader = n),
        (this.rootComponentType = r),
        (this.config = o),
        (this.urlTree = i),
        (this.paramsInheritanceStrategy = s),
        (this.urlSerializer = l),
        (this.applyRedirects = new Du(this.urlSerializer, this.urlTree)),
        (this.absoluteRedirectCount = 0),
        (this.allowRedirects = !0);
    }
    noMatchError(t) {
      return new _(4002, `'${t.segmentGroup}'`);
    }
    recognize() {
      let t = cm(this.urlTree.root, [], [], this.config).segmentGroup;
      return this.match(t).pipe(
        O(({ children: n, rootSnapshot: r }) => {
          let o = new Ue(r, n),
            i = new Ks("", o),
            s = Y_(r, [], this.urlTree.queryParams, this.urlTree.fragment);
          return (
            (s.queryParams = this.urlTree.queryParams),
            (i.url = this.urlSerializer.serialize(s)),
            { state: i, tree: s }
          );
        })
      );
    }
    match(t) {
      let n = new xr(
        [],
        Object.freeze({}),
        Object.freeze(b({}, this.urlTree.queryParams)),
        this.urlTree.fragment,
        Object.freeze({}),
        P,
        this.rootComponentType,
        null,
        {}
      );
      return this.processSegmentGroup(this.injector, this.config, t, P, n).pipe(
        O((r) => ({ children: r, rootSnapshot: n })),
        Lt((r) => {
          if (r instanceof Fo)
            return (this.urlTree = r.urlTree), this.match(r.urlTree.root);
          throw r instanceof Po ? this.noMatchError(r) : r;
        })
      );
    }
    processSegmentGroup(t, n, r, o, i) {
      return r.segments.length === 0 && r.hasChildren()
        ? this.processChildren(t, n, r, i)
        : this.processSegment(t, n, r, r.segments, o, !0, i).pipe(
            O((s) => (s instanceof Ue ? [s] : []))
          );
    }
    processChildren(t, n, r, o) {
      let i = [];
      for (let s of Object.keys(r.children))
        s === "primary" ? i.unshift(s) : i.push(s);
      return oe(i).pipe(
        Vt((s) => {
          let l = r.children[s],
            u = rM(n, s);
          return this.processSegmentGroup(t, u, l, s, o);
        }),
        tc((s, l) => (s.push(...l), s)),
        jt(null),
        ec(),
        ge((s) => {
          if (s === null) return _r(r);
          let l = Pm(s);
          return $M(l), T(l);
        })
      );
    }
    processSegment(t, n, r, o, i, s, l) {
      return oe(n).pipe(
        Vt((u) =>
          this.processSegmentAgainstRoute(
            u._injector ?? t,
            n,
            u,
            r,
            o,
            i,
            s,
            l
          ).pipe(
            Lt((f) => {
              if (f instanceof Po) return T(null);
              throw f;
            })
          )
        ),
        lt((u) => !!u),
        Lt((u) => {
          if (Nm(u)) return jM(r, o, i) ? T(new Cu()) : _r(r);
          throw u;
        })
      );
    }
    processSegmentAgainstRoute(t, n, r, o, i, s, l, u) {
      return st(r) !== s && (s === P || !na(o, i, r))
        ? _r(o)
        : r.redirectTo === void 0
        ? this.matchSegmentAgainstRoute(t, o, r, i, s, u)
        : this.allowRedirects && l
        ? this.expandSegmentAgainstRouteUsingRedirect(t, o, n, r, i, s, u)
        : _r(o);
    }
    expandSegmentAgainstRouteUsingRedirect(t, n, r, o, i, s, l) {
      let {
        matched: u,
        parameters: f,
        consumedSegments: g,
        positionalParamSegments: h,
        remainingSegments: w,
      } = Om(n, o, i);
      if (!u) return _r(n);
      typeof o.redirectTo == "string" &&
        o.redirectTo[0] === "/" &&
        (this.absoluteRedirectCount++,
        this.absoluteRedirectCount > UM && (this.allowRedirects = !1));
      let v = new xr(
          i,
          f,
          Object.freeze(b({}, this.urlTree.queryParams)),
          this.urlTree.fragment,
          lm(o),
          st(o),
          o.component ?? o._loadedComponent ?? null,
          o,
          um(o)
        ),
        D = Qs(v, l, this.paramsInheritanceStrategy);
      (v.params = Object.freeze(D.params)), (v.data = Object.freeze(D.data));
      let I = this.applyRedirects.applyRedirectCommands(
        g,
        o.redirectTo,
        h,
        v,
        t
      );
      return this.applyRedirects
        .lineralizeSegments(o, I)
        .pipe(ge((E) => this.processSegment(t, r, n, E.concat(w), s, !1, l)));
    }
    matchSegmentAgainstRoute(t, n, r, o, i, s) {
      let l = OM(n, r, o, t, this.urlSerializer);
      return (
        r.path === "**" && (n.children = {}),
        l.pipe(
          Te((u) =>
            u.matched
              ? ((t = r._injector ?? t),
                this.getChildConfig(t, r, o).pipe(
                  Te(({ routes: f }) => {
                    let g = r._loadedInjector ?? t,
                      {
                        parameters: h,
                        consumedSegments: w,
                        remainingSegments: v,
                      } = u,
                      D = new xr(
                        w,
                        h,
                        Object.freeze(b({}, this.urlTree.queryParams)),
                        this.urlTree.fragment,
                        lm(r),
                        st(r),
                        r.component ?? r._loadedComponent ?? null,
                        r,
                        um(r)
                      ),
                      I = Qs(D, s, this.paramsInheritanceStrategy);
                    (D.params = Object.freeze(I.params)),
                      (D.data = Object.freeze(I.data));
                    let { segmentGroup: E, slicedSegments: x } = cm(n, w, v, f);
                    if (x.length === 0 && E.hasChildren())
                      return this.processChildren(g, f, E, D).pipe(
                        O((j) => new Ue(D, j))
                      );
                    if (f.length === 0 && x.length === 0)
                      return T(new Ue(D, []));
                    let ee = st(r) === i;
                    return this.processSegment(
                      g,
                      f,
                      E,
                      x,
                      ee ? P : i,
                      !0,
                      D
                    ).pipe(O((j) => new Ue(D, j instanceof Ue ? [j] : [])));
                  })
                ))
              : _r(n)
          )
        )
      );
    }
    getChildConfig(t, n, r) {
      return n.children
        ? T({ routes: n.children, injector: t })
        : n.loadChildren
        ? n._loadedRoutes !== void 0
          ? T({ routes: n._loadedRoutes, injector: n._loadedInjector })
          : TM(t, n, r, this.urlSerializer).pipe(
              ge((o) =>
                o
                  ? this.configLoader.loadChildren(t, n).pipe(
                      ye((i) => {
                        (n._loadedRoutes = i.routes),
                          (n._loadedInjector = i.injector);
                      })
                    )
                  : RM(n)
              )
            )
        : T({ routes: [], injector: t });
    }
  };
function $M(e) {
  e.sort((t, n) =>
    t.value.outlet === P
      ? -1
      : n.value.outlet === P
      ? 1
      : t.value.outlet.localeCompare(n.value.outlet)
  );
}
function HM(e) {
  let t = e.value.routeConfig;
  return t && t.path === "";
}
function Pm(e) {
  let t = [],
    n = new Set();
  for (let r of e) {
    if (!HM(r)) {
      t.push(r);
      continue;
    }
    let o = t.find((i) => r.value.routeConfig === i.value.routeConfig);
    o !== void 0 ? (o.children.push(...r.children), n.add(o)) : t.push(r);
  }
  for (let r of n) {
    let o = Pm(r.children);
    t.push(new Ue(r.value, o));
  }
  return t.filter((r) => !n.has(r));
}
function lm(e) {
  return e.data || {};
}
function um(e) {
  return e.resolve || {};
}
function zM(e, t, n, r, o, i) {
  return ge((s) =>
    BM(e, t, n, r, s.extractedUrl, o, i).pipe(
      O(({ state: l, tree: u }) =>
        U(b({}, s), { targetSnapshot: l, urlAfterRedirects: u })
      )
    )
  );
}
function GM(e, t) {
  return ge((n) => {
    let {
      targetSnapshot: r,
      guards: { canActivateChecks: o },
    } = n;
    if (!o.length) return T(n);
    let i = new Set(o.map((u) => u.route)),
      s = new Set();
    for (let u of i) if (!s.has(u)) for (let f of Fm(u)) s.add(f);
    let l = 0;
    return oe(s).pipe(
      Vt((u) =>
        i.has(u)
          ? qM(u, r, e, t)
          : ((u.data = Qs(u, u.parent, e).resolve), T(void 0))
      ),
      ye(() => l++),
      Jn(1),
      ge((u) => (l === s.size ? T(n) : Le))
    );
  });
}
function Fm(e) {
  let t = e.children.map((n) => Fm(n)).flat();
  return [e, ...t];
}
function qM(e, t, n, r) {
  let o = e.routeConfig,
    i = e._resolve;
  return (
    o?.title !== void 0 && !Sm(o) && (i[ko] = o.title),
    WM(i, e, t, r).pipe(
      O(
        (s) => (
          (e._resolvedData = s), (e.data = Qs(e, e.parent, n).resolve), null
        )
      )
    )
  );
}
function WM(e, t, n, r) {
  let o = Jl(e);
  if (o.length === 0) return T({});
  let i = {};
  return oe(o).pipe(
    ge((s) =>
      ZM(e[s], t, n, r).pipe(
        lt(),
        ye((l) => {
          if (l instanceof Oo) throw Xs(new So(), l);
          i[s] = l;
        })
      )
    ),
    Jn(1),
    Ja(i),
    Lt((s) => (Nm(s) ? Le : Kn(s)))
  );
}
function ZM(e, t, n, r) {
  let o = Lo(t) ?? r,
    i = Or(e, o),
    s = i.resolve ? i.resolve(t, n) : nt(o, () => i(t, n));
  return sn(s);
}
function Kl(e) {
  return Te((t) => {
    let n = e(t);
    return n ? oe(n).pipe(O(() => t)) : T(t);
  });
}
var km = (() => {
    class e {
      buildTitle(n) {
        let r,
          o = n.root;
        for (; o !== void 0; )
          (r = this.getResolvedTitleForRoute(o) ?? r),
            (o = o.children.find((i) => i.outlet === P));
        return r;
      }
      getResolvedTitleForRoute(n) {
        return n.data[ko];
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: () => y(YM), providedIn: "root" });
      }
    }
    return e;
  })(),
  YM = (() => {
    class e extends km {
      constructor(n) {
        super(), (this.title = n);
      }
      updateTitle(n) {
        let r = this.buildTitle(n);
        r !== void 0 && this.title.setTitle(r);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(R(nm));
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  xu = new M("", { providedIn: "root", factory: () => ({}) }),
  QM = (() => {
    class e {
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵcmp = We({
          type: e,
          selectors: [["ng-component"]],
          standalone: !0,
          features: [Ye],
          decls: 1,
          vars: 0,
          template: function (r, o) {
            r & 1 && J(0, "router-outlet");
          },
          dependencies: [Su],
          encapsulation: 2,
        });
      }
    }
    return e;
  })();
function Tu(e) {
  let t = e.children && e.children.map(Tu),
    n = t ? U(b({}, e), { children: t }) : b({}, e);
  return (
    !n.component &&
      !n.loadComponent &&
      (t || n.loadChildren) &&
      n.outlet &&
      n.outlet !== P &&
      (n.component = QM),
    n
  );
}
var Au = new M(""),
  KM = (() => {
    class e {
      constructor() {
        (this.componentLoaders = new WeakMap()),
          (this.childrenLoaders = new WeakMap()),
          (this.compiler = y(Nl));
      }
      loadComponent(n) {
        if (this.componentLoaders.get(n)) return this.componentLoaders.get(n);
        if (n._loadedComponent) return T(n._loadedComponent);
        this.onLoadStartListener && this.onLoadStartListener(n);
        let r = sn(n.loadComponent()).pipe(
            O(Lm),
            ye((i) => {
              this.onLoadEndListener && this.onLoadEndListener(n),
                (n._loadedComponent = i);
            }),
            mn(() => {
              this.componentLoaders.delete(n);
            })
          ),
          o = new Qn(r, () => new ve()).pipe(Yn());
        return this.componentLoaders.set(n, o), o;
      }
      loadChildren(n, r) {
        if (this.childrenLoaders.get(r)) return this.childrenLoaders.get(r);
        if (r._loadedRoutes)
          return T({ routes: r._loadedRoutes, injector: r._loadedInjector });
        this.onLoadStartListener && this.onLoadStartListener(r);
        let i = XM(r, this.compiler, n, this.onLoadEndListener).pipe(
            mn(() => {
              this.childrenLoaders.delete(r);
            })
          ),
          s = new Qn(i, () => new ve()).pipe(Yn());
        return this.childrenLoaders.set(r, s), s;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })();
function XM(e, t, n, r) {
  return sn(e.loadChildren()).pipe(
    O(Lm),
    ge((o) =>
      o instanceof to || Array.isArray(o) ? T(o) : oe(t.compileModuleAsync(o))
    ),
    O((o) => {
      r && r(e);
      let i,
        s,
        l = !1;
      return (
        Array.isArray(o)
          ? ((s = o), (l = !0))
          : ((i = o.create(n).injector),
            (s = i.get(Au, [], { optional: !0, self: !0 }).flat())),
        { routes: s.map(Tu), injector: i }
      );
    })
  );
}
function JM(e) {
  return e && typeof e == "object" && "default" in e;
}
function Lm(e) {
  return JM(e) ? e.default : e;
}
var Nu = (() => {
    class e {
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: () => y(eS), providedIn: "root" });
      }
    }
    return e;
  })(),
  eS = (() => {
    class e {
      shouldProcessUrl(n) {
        return !0;
      }
      extract(n) {
        return n;
      }
      merge(n, r) {
        return n;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  tS = new M("");
var nS = new M(""),
  rS = (() => {
    class e {
      get hasRequestedNavigation() {
        return this.navigationId !== 0;
      }
      constructor() {
        (this.currentNavigation = null),
          (this.currentTransition = null),
          (this.lastSuccessfulNavigation = null),
          (this.events = new ve()),
          (this.transitionAbortSubject = new ve()),
          (this.configLoader = y(KM)),
          (this.environmentInjector = y(Ne)),
          (this.urlSerializer = y(_u)),
          (this.rootContexts = y(ea)),
          (this.location = y(ho)),
          (this.inputBindingEnabled = y(ta, { optional: !0 }) !== null),
          (this.titleStrategy = y(km)),
          (this.options = y(xu, { optional: !0 }) || {}),
          (this.paramsInheritanceStrategy =
            this.options.paramsInheritanceStrategy || "emptyOnly"),
          (this.urlHandlingStrategy = y(Nu)),
          (this.createViewTransition = y(tS, { optional: !0 })),
          (this.navigationErrorHandler = y(nS, { optional: !0 })),
          (this.navigationId = 0),
          (this.afterPreactivation = () => T(void 0)),
          (this.rootComponentType = null);
        let n = (o) => this.events.next(new cu(o)),
          r = (o) => this.events.next(new lu(o));
        (this.configLoader.onLoadEndListener = r),
          (this.configLoader.onLoadStartListener = n);
      }
      complete() {
        this.transitions?.complete();
      }
      handleNavigationRequest(n) {
        let r = ++this.navigationId;
        this.transitions?.next(
          U(b(b({}, this.transitions.value), n), { id: r })
        );
      }
      setupNavigations(n, r, o) {
        return (
          (this.transitions = new we({
            id: 0,
            currentUrlTree: r,
            currentRawUrl: r,
            extractedUrl: this.urlHandlingStrategy.extract(r),
            urlAfterRedirects: this.urlHandlingStrategy.extract(r),
            rawUrl: r,
            extras: {},
            resolve: () => {},
            reject: () => {},
            promise: Promise.resolve(!0),
            source: _o,
            restoredState: null,
            currentSnapshot: o.snapshot,
            targetSnapshot: null,
            currentRouterState: o,
            targetRouterState: null,
            guards: { canActivateChecks: [], canDeactivateChecks: [] },
            guardsResult: null,
          })),
          this.transitions.pipe(
            Ve((i) => i.id !== 0),
            O((i) =>
              U(b({}, i), {
                extractedUrl: this.urlHandlingStrategy.extract(i.rawUrl),
              })
            ),
            Te((i) => {
              let s = !1,
                l = !1;
              return T(i).pipe(
                Te((u) => {
                  if (this.navigationId > i.id)
                    return (
                      this.cancelNavigationTransition(
                        i,
                        "",
                        $e.SupersededByNewNavigation
                      ),
                      Le
                    );
                  (this.currentTransition = i),
                    (this.currentNavigation = {
                      id: u.id,
                      initialUrl: u.rawUrl,
                      extractedUrl: u.extractedUrl,
                      targetBrowserUrl:
                        typeof u.extras.browserUrl == "string"
                          ? this.urlSerializer.parse(u.extras.browserUrl)
                          : u.extras.browserUrl,
                      trigger: u.source,
                      extras: u.extras,
                      previousNavigation: this.lastSuccessfulNavigation
                        ? U(b({}, this.lastSuccessfulNavigation), {
                            previousNavigation: null,
                          })
                        : null,
                    });
                  let f =
                      !n.navigated ||
                      this.isUpdatingInternalState() ||
                      this.isUpdatedBrowserUrl(),
                    g = u.extras.onSameUrlNavigation ?? n.onSameUrlNavigation;
                  if (!f && g !== "reload") {
                    let h = "";
                    return (
                      this.events.next(
                        new Rn(
                          u.id,
                          this.urlSerializer.serialize(u.rawUrl),
                          h,
                          ru.IgnoredSameUrlNavigation
                        )
                      ),
                      u.resolve(!1),
                      Le
                    );
                  }
                  if (this.urlHandlingStrategy.shouldProcessUrl(u.rawUrl))
                    return T(u).pipe(
                      Te((h) => {
                        let w = this.transitions?.getValue();
                        return (
                          this.events.next(
                            new To(
                              h.id,
                              this.urlSerializer.serialize(h.extractedUrl),
                              h.source,
                              h.restoredState
                            )
                          ),
                          w !== this.transitions?.getValue()
                            ? Le
                            : Promise.resolve(h)
                        );
                      }),
                      zM(
                        this.environmentInjector,
                        this.configLoader,
                        this.rootComponentType,
                        n.config,
                        this.urlSerializer,
                        this.paramsInheritanceStrategy
                      ),
                      ye((h) => {
                        (i.targetSnapshot = h.targetSnapshot),
                          (i.urlAfterRedirects = h.urlAfterRedirects),
                          (this.currentNavigation = U(
                            b({}, this.currentNavigation),
                            { finalUrl: h.urlAfterRedirects }
                          ));
                        let w = new Ws(
                          h.id,
                          this.urlSerializer.serialize(h.extractedUrl),
                          this.urlSerializer.serialize(h.urlAfterRedirects),
                          h.targetSnapshot
                        );
                        this.events.next(w);
                      })
                    );
                  if (
                    f &&
                    this.urlHandlingStrategy.shouldProcessUrl(u.currentRawUrl)
                  ) {
                    let {
                        id: h,
                        extractedUrl: w,
                        source: v,
                        restoredState: D,
                        extras: I,
                      } = u,
                      E = new To(h, this.urlSerializer.serialize(w), v, D);
                    this.events.next(E);
                    let x = _m(this.rootComponentType).snapshot;
                    return (
                      (this.currentTransition = i =
                        U(b({}, u), {
                          targetSnapshot: x,
                          urlAfterRedirects: w,
                          extras: U(b({}, I), {
                            skipLocationChange: !1,
                            replaceUrl: !1,
                          }),
                        })),
                      (this.currentNavigation.finalUrl = w),
                      T(i)
                    );
                  } else {
                    let h = "";
                    return (
                      this.events.next(
                        new Rn(
                          u.id,
                          this.urlSerializer.serialize(u.extractedUrl),
                          h,
                          ru.IgnoredByUrlHandlingStrategy
                        )
                      ),
                      u.resolve(!1),
                      Le
                    );
                  }
                }),
                ye((u) => {
                  let f = new ou(
                    u.id,
                    this.urlSerializer.serialize(u.extractedUrl),
                    this.urlSerializer.serialize(u.urlAfterRedirects),
                    u.targetSnapshot
                  );
                  this.events.next(f);
                }),
                O(
                  (u) => (
                    (this.currentTransition = i =
                      U(b({}, u), {
                        guards: uM(
                          u.targetSnapshot,
                          u.currentSnapshot,
                          this.rootContexts
                        ),
                      })),
                    i
                  )
                ),
                bM(this.environmentInjector, (u) => this.events.next(u)),
                ye((u) => {
                  if (
                    ((i.guardsResult = u.guardsResult),
                    u.guardsResult && typeof u.guardsResult != "boolean")
                  )
                    throw Xs(this.urlSerializer, u.guardsResult);
                  let f = new iu(
                    u.id,
                    this.urlSerializer.serialize(u.extractedUrl),
                    this.urlSerializer.serialize(u.urlAfterRedirects),
                    u.targetSnapshot,
                    !!u.guardsResult
                  );
                  this.events.next(f);
                }),
                Ve((u) =>
                  u.guardsResult
                    ? !0
                    : (this.cancelNavigationTransition(u, "", $e.GuardRejected),
                      !1)
                ),
                Kl((u) => {
                  if (u.guards.canActivateChecks.length)
                    return T(u).pipe(
                      ye((f) => {
                        let g = new su(
                          f.id,
                          this.urlSerializer.serialize(f.extractedUrl),
                          this.urlSerializer.serialize(f.urlAfterRedirects),
                          f.targetSnapshot
                        );
                        this.events.next(g);
                      }),
                      Te((f) => {
                        let g = !1;
                        return T(f).pipe(
                          GM(
                            this.paramsInheritanceStrategy,
                            this.environmentInjector
                          ),
                          ye({
                            next: () => (g = !0),
                            complete: () => {
                              g ||
                                this.cancelNavigationTransition(
                                  f,
                                  "",
                                  $e.NoDataFromResolver
                                );
                            },
                          })
                        );
                      }),
                      ye((f) => {
                        let g = new au(
                          f.id,
                          this.urlSerializer.serialize(f.extractedUrl),
                          this.urlSerializer.serialize(f.urlAfterRedirects),
                          f.targetSnapshot
                        );
                        this.events.next(g);
                      })
                    );
                }),
                Kl((u) => {
                  let f = (g) => {
                    let h = [];
                    g.routeConfig?.loadComponent &&
                      !g.routeConfig._loadedComponent &&
                      h.push(
                        this.configLoader.loadComponent(g.routeConfig).pipe(
                          ye((w) => {
                            g.component = w;
                          }),
                          O(() => {})
                        )
                      );
                    for (let w of g.children) h.push(...f(w));
                    return h;
                  };
                  return qr(f(u.targetSnapshot.root)).pipe(jt(null), bt(1));
                }),
                Kl(() => this.afterPreactivation()),
                Te(() => {
                  let { currentSnapshot: u, targetSnapshot: f } = i,
                    g = this.createViewTransition?.(
                      this.environmentInjector,
                      u.root,
                      f.root
                    );
                  return g ? oe(g).pipe(O(() => i)) : T(i);
                }),
                O((u) => {
                  let f = iM(
                    n.routeReuseStrategy,
                    u.targetSnapshot,
                    u.currentRouterState
                  );
                  return (
                    (this.currentTransition = i =
                      U(b({}, u), { targetRouterState: f })),
                    (this.currentNavigation.targetRouterState = f),
                    i
                  );
                }),
                ye(() => {
                  this.events.next(new No());
                }),
                lM(
                  this.rootContexts,
                  n.routeReuseStrategy,
                  (u) => this.events.next(u),
                  this.inputBindingEnabled
                ),
                bt(1),
                ye({
                  next: (u) => {
                    (s = !0),
                      (this.lastSuccessfulNavigation = this.currentNavigation),
                      this.events.next(
                        new on(
                          u.id,
                          this.urlSerializer.serialize(u.extractedUrl),
                          this.urlSerializer.serialize(u.urlAfterRedirects)
                        )
                      ),
                      this.titleStrategy?.updateTitle(
                        u.targetRouterState.snapshot
                      ),
                      u.resolve(!0);
                  },
                  complete: () => {
                    s = !0;
                  },
                }),
                rc(
                  this.transitionAbortSubject.pipe(
                    ye((u) => {
                      throw u;
                    })
                  )
                ),
                mn(() => {
                  !s &&
                    !l &&
                    this.cancelNavigationTransition(
                      i,
                      "",
                      $e.SupersededByNewNavigation
                    ),
                    this.currentTransition?.id === i.id &&
                      ((this.currentNavigation = null),
                      (this.currentTransition = null));
                }),
                Lt((u) => {
                  if (((l = !0), Am(u)))
                    this.events.next(
                      new At(
                        i.id,
                        this.urlSerializer.serialize(i.extractedUrl),
                        u.message,
                        u.cancellationCode
                      )
                    ),
                      cM(u)
                        ? this.events.next(
                            new Nr(u.url, u.navigationBehaviorOptions)
                          )
                        : i.resolve(!1);
                  else {
                    let f = new Ao(
                      i.id,
                      this.urlSerializer.serialize(i.extractedUrl),
                      u,
                      i.targetSnapshot ?? void 0
                    );
                    try {
                      let g = nt(this.environmentInjector, () =>
                        this.navigationErrorHandler?.(f)
                      );
                      if (g instanceof Oo) {
                        let { message: h, cancellationCode: w } = Xs(
                          this.urlSerializer,
                          g
                        );
                        this.events.next(
                          new At(
                            i.id,
                            this.urlSerializer.serialize(i.extractedUrl),
                            h,
                            w
                          )
                        ),
                          this.events.next(
                            new Nr(g.redirectTo, g.navigationBehaviorOptions)
                          );
                      } else {
                        this.events.next(f);
                        let h = n.errorHandler(u);
                        i.resolve(!!h);
                      }
                    } catch (g) {
                      this.options.resolveNavigationPromiseOnError
                        ? i.resolve(!1)
                        : i.reject(g);
                    }
                  }
                  return Le;
                })
              );
            })
          )
        );
      }
      cancelNavigationTransition(n, r, o) {
        let i = new At(
          n.id,
          this.urlSerializer.serialize(n.extractedUrl),
          r,
          o
        );
        this.events.next(i), n.resolve(!1);
      }
      isUpdatingInternalState() {
        return (
          this.currentTransition?.extractedUrl.toString() !==
          this.currentTransition?.currentUrlTree.toString()
        );
      }
      isUpdatedBrowserUrl() {
        let n = this.urlHandlingStrategy.extract(
            this.urlSerializer.parse(this.location.path(!0))
          ),
          r =
            this.currentNavigation?.targetBrowserUrl ??
            this.currentNavigation?.extractedUrl;
        return (
          n.toString() !== r?.toString() &&
          !this.currentNavigation?.extras.skipLocationChange
        );
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })();
function oS(e) {
  return e !== _o;
}
var iS = (() => {
    class e {
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: () => y(sS), providedIn: "root" });
      }
    }
    return e;
  })(),
  Iu = class {
    shouldDetach(t) {
      return !1;
    }
    store(t, n) {}
    shouldAttach(t) {
      return !1;
    }
    retrieve(t) {
      return null;
    }
    shouldReuseRoute(t, n) {
      return t.routeConfig === n.routeConfig;
    }
  },
  sS = (() => {
    class e extends Iu {
      static {
        this.ɵfac = (() => {
          let n;
          return function (o) {
            return (n || (n = so(e)))(o || e);
          };
        })();
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  Vm = (() => {
    class e {
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: () => y(aS), providedIn: "root" });
      }
    }
    return e;
  })(),
  aS = (() => {
    class e extends Vm {
      constructor() {
        super(...arguments),
          (this.location = y(ho)),
          (this.urlSerializer = y(_u)),
          (this.options = y(xu, { optional: !0 }) || {}),
          (this.canceledNavigationResolution =
            this.options.canceledNavigationResolution || "replace"),
          (this.urlHandlingStrategy = y(Nu)),
          (this.urlUpdateStrategy =
            this.options.urlUpdateStrategy || "deferred"),
          (this.currentUrlTree = new Nt()),
          (this.rawUrlTree = this.currentUrlTree),
          (this.currentPageId = 0),
          (this.lastSuccessfulId = -1),
          (this.routerState = _m(null)),
          (this.stateMemento = this.createStateMemento());
      }
      getCurrentUrlTree() {
        return this.currentUrlTree;
      }
      getRawUrlTree() {
        return this.rawUrlTree;
      }
      restoredState() {
        return this.location.getState();
      }
      get browserPageId() {
        return this.canceledNavigationResolution !== "computed"
          ? this.currentPageId
          : this.restoredState()?.ɵrouterPageId ?? this.currentPageId;
      }
      getRouterState() {
        return this.routerState;
      }
      createStateMemento() {
        return {
          rawUrlTree: this.rawUrlTree,
          currentUrlTree: this.currentUrlTree,
          routerState: this.routerState,
        };
      }
      registerNonRouterCurrentEntryChangeListener(n) {
        return this.location.subscribe((r) => {
          r.type === "popstate" && n(r.url, r.state);
        });
      }
      handleRouterEvent(n, r) {
        if (n instanceof To) this.stateMemento = this.createStateMemento();
        else if (n instanceof Rn) this.rawUrlTree = r.initialUrl;
        else if (n instanceof Ws) {
          if (
            this.urlUpdateStrategy === "eager" &&
            !r.extras.skipLocationChange
          ) {
            let o = this.urlHandlingStrategy.merge(r.finalUrl, r.initialUrl);
            this.setBrowserUrl(r.targetBrowserUrl ?? o, r);
          }
        } else
          n instanceof No
            ? ((this.currentUrlTree = r.finalUrl),
              (this.rawUrlTree = this.urlHandlingStrategy.merge(
                r.finalUrl,
                r.initialUrl
              )),
              (this.routerState = r.targetRouterState),
              this.urlUpdateStrategy === "deferred" &&
                !r.extras.skipLocationChange &&
                this.setBrowserUrl(r.targetBrowserUrl ?? this.rawUrlTree, r))
            : n instanceof At &&
              (n.code === $e.GuardRejected || n.code === $e.NoDataFromResolver)
            ? this.restoreHistory(r)
            : n instanceof Ao
            ? this.restoreHistory(r, !0)
            : n instanceof on &&
              ((this.lastSuccessfulId = n.id),
              (this.currentPageId = this.browserPageId));
      }
      setBrowserUrl(n, r) {
        let o = n instanceof Nt ? this.urlSerializer.serialize(n) : n;
        if (this.location.isCurrentPathEqualTo(o) || r.extras.replaceUrl) {
          let i = this.browserPageId,
            s = b(b({}, r.extras.state), this.generateNgRouterState(r.id, i));
          this.location.replaceState(o, "", s);
        } else {
          let i = b(
            b({}, r.extras.state),
            this.generateNgRouterState(r.id, this.browserPageId + 1)
          );
          this.location.go(o, "", i);
        }
      }
      restoreHistory(n, r = !1) {
        if (this.canceledNavigationResolution === "computed") {
          let o = this.browserPageId,
            i = this.currentPageId - o;
          i !== 0
            ? this.location.historyGo(i)
            : this.currentUrlTree === n.finalUrl &&
              i === 0 &&
              (this.resetState(n), this.resetUrlToCurrentUrlTree());
        } else
          this.canceledNavigationResolution === "replace" &&
            (r && this.resetState(n), this.resetUrlToCurrentUrlTree());
      }
      resetState(n) {
        (this.routerState = this.stateMemento.routerState),
          (this.currentUrlTree = this.stateMemento.currentUrlTree),
          (this.rawUrlTree = this.urlHandlingStrategy.merge(
            this.currentUrlTree,
            n.finalUrl ?? this.rawUrlTree
          ));
      }
      resetUrlToCurrentUrlTree() {
        this.location.replaceState(
          this.urlSerializer.serialize(this.rawUrlTree),
          "",
          this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId)
        );
      }
      generateNgRouterState(n, r) {
        return this.canceledNavigationResolution === "computed"
          ? { navigationId: n, ɵrouterPageId: r }
          : { navigationId: n };
      }
      static {
        this.ɵfac = (() => {
          let n;
          return function (o) {
            return (n || (n = so(e)))(o || e);
          };
        })();
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })(),
  Eo = (function (e) {
    return (
      (e[(e.COMPLETE = 0)] = "COMPLETE"),
      (e[(e.FAILED = 1)] = "FAILED"),
      (e[(e.REDIRECTING = 2)] = "REDIRECTING"),
      e
    );
  })(Eo || {});
function cS(e, t) {
  e.events
    .pipe(
      Ve(
        (n) =>
          n instanceof on ||
          n instanceof At ||
          n instanceof Ao ||
          n instanceof Rn
      ),
      O((n) =>
        n instanceof on || n instanceof Rn
          ? Eo.COMPLETE
          : (
              n instanceof At
                ? n.code === $e.Redirect ||
                  n.code === $e.SupersededByNewNavigation
                : !1
            )
          ? Eo.REDIRECTING
          : Eo.FAILED
      ),
      Ve((n) => n !== Eo.REDIRECTING),
      bt(1)
    )
    .subscribe(() => {
      t();
    });
}
function lS(e) {
  throw e;
}
var uS = {
    paths: "exact",
    fragment: "ignored",
    matrixParams: "ignored",
    queryParams: "exact",
  },
  dS = {
    paths: "subset",
    fragment: "ignored",
    matrixParams: "ignored",
    queryParams: "subset",
  },
  Rt = (() => {
    class e {
      get currentUrlTree() {
        return this.stateManager.getCurrentUrlTree();
      }
      get rawUrlTree() {
        return this.stateManager.getRawUrlTree();
      }
      get events() {
        return this._events;
      }
      get routerState() {
        return this.stateManager.getRouterState();
      }
      constructor() {
        (this.disposed = !1),
          (this.console = y(Ts)),
          (this.stateManager = y(Vm)),
          (this.options = y(xu, { optional: !0 }) || {}),
          (this.pendingTasks = y(Qt)),
          (this.urlUpdateStrategy =
            this.options.urlUpdateStrategy || "deferred"),
          (this.navigationTransitions = y(rS)),
          (this.urlSerializer = y(_u)),
          (this.location = y(ho)),
          (this.urlHandlingStrategy = y(Nu)),
          (this._events = new ve()),
          (this.errorHandler = this.options.errorHandler || lS),
          (this.navigated = !1),
          (this.routeReuseStrategy = y(iS)),
          (this.onSameUrlNavigation =
            this.options.onSameUrlNavigation || "ignore"),
          (this.config = y(Au, { optional: !0 })?.flat() ?? []),
          (this.componentInputBindingEnabled = !!y(ta, { optional: !0 })),
          (this.eventsSubscription = new le()),
          this.resetConfig(this.config),
          this.navigationTransitions
            .setupNavigations(this, this.currentUrlTree, this.routerState)
            .subscribe({
              error: (n) => {
                this.console.warn(n);
              },
            }),
          this.subscribeToNavigationEvents();
      }
      subscribeToNavigationEvents() {
        let n = this.navigationTransitions.events.subscribe((r) => {
          try {
            let o = this.navigationTransitions.currentTransition,
              i = this.navigationTransitions.currentNavigation;
            if (o !== null && i !== null) {
              if (
                (this.stateManager.handleRouterEvent(r, i),
                r instanceof At &&
                  r.code !== $e.Redirect &&
                  r.code !== $e.SupersededByNewNavigation)
              )
                this.navigated = !0;
              else if (r instanceof on) this.navigated = !0;
              else if (r instanceof Nr) {
                let s = r.navigationBehaviorOptions,
                  l = this.urlHandlingStrategy.merge(r.url, o.currentRawUrl),
                  u = b(
                    {
                      browserUrl: o.extras.browserUrl,
                      info: o.extras.info,
                      skipLocationChange: o.extras.skipLocationChange,
                      replaceUrl:
                        o.extras.replaceUrl ||
                        this.urlUpdateStrategy === "eager" ||
                        oS(o.source),
                    },
                    s
                  );
                this.scheduleNavigation(l, _o, null, u, {
                  resolve: o.resolve,
                  reject: o.reject,
                  promise: o.promise,
                });
              }
            }
            hS(r) && this._events.next(r);
          } catch (o) {
            this.navigationTransitions.transitionAbortSubject.next(o);
          }
        });
        this.eventsSubscription.add(n);
      }
      resetRootComponentType(n) {
        (this.routerState.root.component = n),
          (this.navigationTransitions.rootComponentType = n);
      }
      initialNavigation() {
        this.setUpLocationChangeListener(),
          this.navigationTransitions.hasRequestedNavigation ||
            this.navigateToSyncWithBrowser(
              this.location.path(!0),
              _o,
              this.stateManager.restoredState()
            );
      }
      setUpLocationChangeListener() {
        this.nonRouterCurrentEntryChangeSubscription ??=
          this.stateManager.registerNonRouterCurrentEntryChangeListener(
            (n, r) => {
              setTimeout(() => {
                this.navigateToSyncWithBrowser(n, "popstate", r);
              }, 0);
            }
          );
      }
      navigateToSyncWithBrowser(n, r, o) {
        let i = { replaceUrl: !0 },
          s = o?.navigationId ? o : null;
        if (o) {
          let u = b({}, o);
          delete u.navigationId,
            delete u.ɵrouterPageId,
            Object.keys(u).length !== 0 && (i.state = u);
        }
        let l = this.parseUrl(n);
        this.scheduleNavigation(l, r, s, i);
      }
      get url() {
        return this.serializeUrl(this.currentUrlTree);
      }
      getCurrentNavigation() {
        return this.navigationTransitions.currentNavigation;
      }
      get lastSuccessfulNavigation() {
        return this.navigationTransitions.lastSuccessfulNavigation;
      }
      resetConfig(n) {
        (this.config = n.map(Tu)), (this.navigated = !1);
      }
      ngOnDestroy() {
        this.dispose();
      }
      dispose() {
        this.navigationTransitions.complete(),
          this.nonRouterCurrentEntryChangeSubscription &&
            (this.nonRouterCurrentEntryChangeSubscription.unsubscribe(),
            (this.nonRouterCurrentEntryChangeSubscription = void 0)),
          (this.disposed = !0),
          this.eventsSubscription.unsubscribe();
      }
      createUrlTree(n, r = {}) {
        let {
            relativeTo: o,
            queryParams: i,
            fragment: s,
            queryParamsHandling: l,
            preserveFragment: u,
          } = r,
          f = u ? this.currentUrlTree.fragment : s,
          g = null;
        switch (l ?? this.options.defaultQueryParamsHandling) {
          case "merge":
            g = b(b({}, this.currentUrlTree.queryParams), i);
            break;
          case "preserve":
            g = this.currentUrlTree.queryParams;
            break;
          default:
            g = i || null;
        }
        g !== null && (g = this.removeEmptyProps(g));
        let h;
        try {
          let w = o ? o.snapshot : this.routerState.snapshot.root;
          h = bm(w);
        } catch {
          (typeof n[0] != "string" || n[0][0] !== "/") && (n = []),
            (h = this.currentUrlTree.root);
        }
        return Cm(h, n, g, f ?? null);
      }
      navigateByUrl(n, r = { skipLocationChange: !1 }) {
        let o = Nn(n) ? n : this.parseUrl(n),
          i = this.urlHandlingStrategy.merge(o, this.rawUrlTree);
        return this.scheduleNavigation(i, _o, null, r);
      }
      navigate(n, r = { skipLocationChange: !1 }) {
        return fS(n), this.navigateByUrl(this.createUrlTree(n, r), r);
      }
      serializeUrl(n) {
        return this.urlSerializer.serialize(n);
      }
      parseUrl(n) {
        try {
          return this.urlSerializer.parse(n);
        } catch {
          return this.urlSerializer.parse("/");
        }
      }
      isActive(n, r) {
        let o;
        if (
          (r === !0 ? (o = b({}, uS)) : r === !1 ? (o = b({}, dS)) : (o = r),
          Nn(n))
        )
          return rm(this.currentUrlTree, n, o);
        let i = this.parseUrl(n);
        return rm(this.currentUrlTree, i, o);
      }
      removeEmptyProps(n) {
        return Object.entries(n).reduce(
          (r, [o, i]) => (i != null && (r[o] = i), r),
          {}
        );
      }
      scheduleNavigation(n, r, o, i, s) {
        if (this.disposed) return Promise.resolve(!1);
        let l, u, f;
        s
          ? ((l = s.resolve), (u = s.reject), (f = s.promise))
          : (f = new Promise((h, w) => {
              (l = h), (u = w);
            }));
        let g = this.pendingTasks.add();
        return (
          cS(this, () => {
            queueMicrotask(() => this.pendingTasks.remove(g));
          }),
          this.navigationTransitions.handleNavigationRequest({
            source: r,
            restoredState: o,
            currentUrlTree: this.currentUrlTree,
            currentRawUrl: this.currentUrlTree,
            rawUrl: n,
            extras: i,
            resolve: l,
            reject: u,
            promise: f,
            currentSnapshot: this.routerState.snapshot,
            currentRouterState: this.routerState,
          }),
          f.catch((h) => Promise.reject(h))
        );
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
      }
    }
    return e;
  })();
function fS(e) {
  for (let t = 0; t < e.length; t++) if (e[t] == null) throw new _(4008, !1);
}
function hS(e) {
  return !(e instanceof No) && !(e instanceof Nr);
}
var jm = (() => {
  class e {
    constructor(n, r, o, i, s, l) {
      (this.router = n),
        (this.route = r),
        (this.tabIndexAttribute = o),
        (this.renderer = i),
        (this.el = s),
        (this.locationStrategy = l),
        (this.href = null),
        (this.onChanges = new ve()),
        (this.preserveFragment = !1),
        (this.skipLocationChange = !1),
        (this.replaceUrl = !1),
        (this.routerLinkInput = null);
      let u = s.nativeElement.tagName?.toLowerCase();
      (this.isAnchorElement = u === "a" || u === "area"),
        this.isAnchorElement
          ? (this.subscription = n.events.subscribe((f) => {
              f instanceof on && this.updateHref();
            }))
          : this.setTabIndexIfNotOnNativeEl("0");
    }
    setTabIndexIfNotOnNativeEl(n) {
      this.tabIndexAttribute != null ||
        this.isAnchorElement ||
        this.applyAttributeValue("tabindex", n);
    }
    ngOnChanges(n) {
      this.isAnchorElement && this.updateHref(), this.onChanges.next(this);
    }
    set routerLink(n) {
      n == null
        ? ((this.routerLinkInput = null), this.setTabIndexIfNotOnNativeEl(null))
        : (Nn(n)
            ? (this.routerLinkInput = n)
            : (this.routerLinkInput = Array.isArray(n) ? n : [n]),
          this.setTabIndexIfNotOnNativeEl("0"));
    }
    onClick(n, r, o, i, s) {
      let l = this.urlTree;
      if (
        l === null ||
        (this.isAnchorElement &&
          (n !== 0 ||
            r ||
            o ||
            i ||
            s ||
            (typeof this.target == "string" && this.target != "_self")))
      )
        return !0;
      let u = {
        skipLocationChange: this.skipLocationChange,
        replaceUrl: this.replaceUrl,
        state: this.state,
        info: this.info,
      };
      return this.router.navigateByUrl(l, u), !this.isAnchorElement;
    }
    ngOnDestroy() {
      this.subscription?.unsubscribe();
    }
    updateHref() {
      let n = this.urlTree;
      this.href =
        n !== null && this.locationStrategy
          ? this.locationStrategy?.prepareExternalUrl(
              this.router.serializeUrl(n)
            )
          : null;
      let r =
        this.href === null
          ? null
          : kp(this.href, this.el.nativeElement.tagName.toLowerCase(), "href");
      this.applyAttributeValue("href", r);
    }
    applyAttributeValue(n, r) {
      let o = this.renderer,
        i = this.el.nativeElement;
      r !== null ? o.setAttribute(i, n, r) : o.removeAttribute(i, n);
    }
    get urlTree() {
      return this.routerLinkInput === null
        ? null
        : Nn(this.routerLinkInput)
        ? this.routerLinkInput
        : this.router.createUrlTree(this.routerLinkInput, {
            relativeTo:
              this.relativeTo !== void 0 ? this.relativeTo : this.route,
            queryParams: this.queryParams,
            fragment: this.fragment,
            queryParamsHandling: this.queryParamsHandling,
            preserveFragment: this.preserveFragment,
          });
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)(X(Rt), X(On), dl("tabindex"), X(Mn), X(Kt), X(Ir));
      };
    }
    static {
      this.ɵdir = je({
        type: e,
        selectors: [["", "routerLink", ""]],
        hostVars: 1,
        hostBindings: function (r, o) {
          r & 1 &&
            vt("click", function (s) {
              return o.onClick(
                s.button,
                s.ctrlKey,
                s.shiftKey,
                s.altKey,
                s.metaKey
              );
            }),
            r & 2 && Ms("target", o.target);
        },
        inputs: {
          target: "target",
          queryParams: "queryParams",
          fragment: "fragment",
          queryParamsHandling: "queryParamsHandling",
          state: "state",
          info: "info",
          relativeTo: "relativeTo",
          preserveFragment: [2, "preserveFragment", "preserveFragment", Cr],
          skipLocationChange: [
            2,
            "skipLocationChange",
            "skipLocationChange",
            Cr,
          ],
          replaceUrl: [2, "replaceUrl", "replaceUrl", Cr],
          routerLink: "routerLink",
        },
        standalone: !0,
        features: [xl, Zt],
      });
    }
  }
  return e;
})();
var pS = new M("");
function Bm(e, ...t) {
  return wr([
    { provide: Au, multi: !0, useValue: e },
    [],
    { provide: On, useFactory: gS, deps: [Rt] },
    { provide: As, multi: !0, useFactory: vS },
    t.map((n) => n.ɵproviders),
  ]);
}
function gS(e) {
  return e.routerState.root;
}
function mS(e, t) {
  return { ɵkind: e, ɵproviders: t };
}
function vS() {
  let e = y(qt);
  return (t) => {
    let n = e.get(en);
    if (t !== n.components[0]) return;
    let r = e.get(Rt),
      o = e.get(yS);
    e.get(wS) === 1 && r.initialNavigation(),
      e.get(DS, null, k.Optional)?.setUpPreloading(),
      e.get(pS, null, k.Optional)?.init(),
      r.resetRootComponentType(n.componentTypes[0]),
      o.closed || (o.next(), o.complete(), o.unsubscribe());
  };
}
var yS = new M("", { factory: () => new ve() }),
  wS = new M("", { providedIn: "root", factory: () => 1 });
var DS = new M("");
function Um() {
  return mS(8, [am, { provide: ta, useExisting: am }]);
}
var Ym = (() => {
    class e {
      constructor(n, r) {
        (this._renderer = n),
          (this._elementRef = r),
          (this.onChange = (o) => {}),
          (this.onTouched = () => {});
      }
      setProperty(n, r) {
        this._renderer.setProperty(this._elementRef.nativeElement, n, r);
      }
      registerOnTouched(n) {
        this.onTouched = n;
      }
      registerOnChange(n) {
        this.onChange = n;
      }
      setDisabledState(n) {
        this.setProperty("disabled", n);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(X(Mn), X(Kt));
        };
      }
      static {
        this.ɵdir = je({ type: e });
      }
    }
    return e;
  })(),
  bS = (() => {
    class e extends Ym {
      static {
        this.ɵfac = (() => {
          let n;
          return function (o) {
            return (n || (n = so(e)))(o || e);
          };
        })();
      }
      static {
        this.ɵdir = je({ type: e, features: [Jt] });
      }
    }
    return e;
  })(),
  Qm = new M("");
var CS = { provide: Qm, useExisting: yr(() => fa), multi: !0 };
function ES() {
  let e = xt() ? xt().getUserAgent() : "";
  return /android (\d+)/.test(e.toLowerCase());
}
var IS = new M(""),
  fa = (() => {
    class e extends Ym {
      constructor(n, r, o) {
        super(n, r),
          (this._compositionMode = o),
          (this._composing = !1),
          this._compositionMode == null && (this._compositionMode = !ES());
      }
      writeValue(n) {
        let r = n ?? "";
        this.setProperty("value", r);
      }
      _handleInput(n) {
        (!this._compositionMode ||
          (this._compositionMode && !this._composing)) &&
          this.onChange(n);
      }
      _compositionStart() {
        this._composing = !0;
      }
      _compositionEnd(n) {
        (this._composing = !1), this._compositionMode && this.onChange(n);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(X(Mn), X(Kt), X(IS, 8));
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [
            ["input", "formControlName", "", 3, "type", "checkbox"],
            ["textarea", "formControlName", ""],
            ["input", "formControl", "", 3, "type", "checkbox"],
            ["textarea", "formControl", ""],
            ["input", "ngModel", "", 3, "type", "checkbox"],
            ["textarea", "ngModel", ""],
            ["", "ngDefaultControl", ""],
          ],
          hostBindings: function (r, o) {
            r & 1 &&
              vt("input", function (s) {
                return o._handleInput(s.target.value);
              })("blur", function () {
                return o.onTouched();
              })("compositionstart", function () {
                return o._compositionStart();
              })("compositionend", function (s) {
                return o._compositionEnd(s.target.value);
              });
          },
          features: [xs([CS]), Jt],
        });
      }
    }
    return e;
  })();
var Km = new M(""),
  Xm = new M("");
function Jm(e) {
  return e != null;
}
function ev(e) {
  return Sn(e) ? oe(e) : e;
}
function tv(e) {
  let t = {};
  return (
    e.forEach((n) => {
      t = n != null ? b(b({}, t), n) : t;
    }),
    Object.keys(t).length === 0 ? null : t
  );
}
function nv(e, t) {
  return t.map((n) => n(e));
}
function _S(e) {
  return !e.validate;
}
function rv(e) {
  return e.map((t) => (_S(t) ? t : (n) => t.validate(n)));
}
function MS(e) {
  if (!e) return null;
  let t = e.filter(Jm);
  return t.length == 0
    ? null
    : function (n) {
        return tv(nv(n, t));
      };
}
function ov(e) {
  return e != null ? MS(rv(e)) : null;
}
function SS(e) {
  if (!e) return null;
  let t = e.filter(Jm);
  return t.length == 0
    ? null
    : function (n) {
        let r = nv(n, t).map(ev);
        return Xa(r).pipe(O(tv));
      };
}
function iv(e) {
  return e != null ? SS(rv(e)) : null;
}
function $m(e, t) {
  return e === null ? [t] : Array.isArray(e) ? [...e, t] : [e, t];
}
function sv(e) {
  return e._rawValidators;
}
function av(e) {
  return e._rawAsyncValidators;
}
function Ru(e) {
  return e ? (Array.isArray(e) ? e : [e]) : [];
}
function oa(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Hm(e, t) {
  let n = Ru(t);
  return (
    Ru(e).forEach((o) => {
      oa(n, o) || n.push(o);
    }),
    n
  );
}
function zm(e, t) {
  return Ru(t).filter((n) => !oa(e, n));
}
var ia = class {
    constructor() {
      (this._rawValidators = []),
        (this._rawAsyncValidators = []),
        (this._onDestroyCallbacks = []);
    }
    get value() {
      return this.control ? this.control.value : null;
    }
    get valid() {
      return this.control ? this.control.valid : null;
    }
    get invalid() {
      return this.control ? this.control.invalid : null;
    }
    get pending() {
      return this.control ? this.control.pending : null;
    }
    get disabled() {
      return this.control ? this.control.disabled : null;
    }
    get enabled() {
      return this.control ? this.control.enabled : null;
    }
    get errors() {
      return this.control ? this.control.errors : null;
    }
    get pristine() {
      return this.control ? this.control.pristine : null;
    }
    get dirty() {
      return this.control ? this.control.dirty : null;
    }
    get touched() {
      return this.control ? this.control.touched : null;
    }
    get status() {
      return this.control ? this.control.status : null;
    }
    get untouched() {
      return this.control ? this.control.untouched : null;
    }
    get statusChanges() {
      return this.control ? this.control.statusChanges : null;
    }
    get valueChanges() {
      return this.control ? this.control.valueChanges : null;
    }
    get path() {
      return null;
    }
    _setValidators(t) {
      (this._rawValidators = t || []),
        (this._composedValidatorFn = ov(this._rawValidators));
    }
    _setAsyncValidators(t) {
      (this._rawAsyncValidators = t || []),
        (this._composedAsyncValidatorFn = iv(this._rawAsyncValidators));
    }
    get validator() {
      return this._composedValidatorFn || null;
    }
    get asyncValidator() {
      return this._composedAsyncValidatorFn || null;
    }
    _registerOnDestroy(t) {
      this._onDestroyCallbacks.push(t);
    }
    _invokeOnDestroyCallbacks() {
      this._onDestroyCallbacks.forEach((t) => t()),
        (this._onDestroyCallbacks = []);
    }
    reset(t = void 0) {
      this.control && this.control.reset(t);
    }
    hasError(t, n) {
      return this.control ? this.control.hasError(t, n) : !1;
    }
    getError(t, n) {
      return this.control ? this.control.getError(t, n) : null;
    }
  },
  kr = class extends ia {
    get formDirective() {
      return null;
    }
    get path() {
      return null;
    }
  },
  Ho = class extends ia {
    constructor() {
      super(...arguments),
        (this._parent = null),
        (this.name = null),
        (this.valueAccessor = null);
    }
  },
  sa = class {
    constructor(t) {
      this._cd = t;
    }
    get isTouched() {
      return this._cd?.control?._touched?.(), !!this._cd?.control?.touched;
    }
    get isUntouched() {
      return !!this._cd?.control?.untouched;
    }
    get isPristine() {
      return this._cd?.control?._pristine?.(), !!this._cd?.control?.pristine;
    }
    get isDirty() {
      return !!this._cd?.control?.dirty;
    }
    get isValid() {
      return this._cd?.control?._status?.(), !!this._cd?.control?.valid;
    }
    get isInvalid() {
      return !!this._cd?.control?.invalid;
    }
    get isPending() {
      return !!this._cd?.control?.pending;
    }
    get isSubmitted() {
      return this._cd?._submitted?.(), !!this._cd?.submitted;
    }
  },
  xS = {
    "[class.ng-untouched]": "isUntouched",
    "[class.ng-touched]": "isTouched",
    "[class.ng-pristine]": "isPristine",
    "[class.ng-dirty]": "isDirty",
    "[class.ng-valid]": "isValid",
    "[class.ng-invalid]": "isInvalid",
    "[class.ng-pending]": "isPending",
  },
  ZP = U(b({}, xS), { "[class.ng-submitted]": "isSubmitted" }),
  cv = (() => {
    class e extends sa {
      constructor(n) {
        super(n);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(X(Ho, 2));
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [
            ["", "formControlName", ""],
            ["", "ngModel", ""],
            ["", "formControl", ""],
          ],
          hostVars: 14,
          hostBindings: function (r, o) {
            r & 2 &&
              Ss("ng-untouched", o.isUntouched)("ng-touched", o.isTouched)(
                "ng-pristine",
                o.isPristine
              )("ng-dirty", o.isDirty)("ng-valid", o.isValid)(
                "ng-invalid",
                o.isInvalid
              )("ng-pending", o.isPending);
          },
          features: [Jt],
        });
      }
    }
    return e;
  })(),
  lv = (() => {
    class e extends sa {
      constructor(n) {
        super(n);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(X(kr, 10));
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [
            ["", "formGroupName", ""],
            ["", "formArrayName", ""],
            ["", "ngModelGroup", ""],
            ["", "formGroup", ""],
            ["form", 3, "ngNoForm", ""],
            ["", "ngForm", ""],
          ],
          hostVars: 16,
          hostBindings: function (r, o) {
            r & 2 &&
              Ss("ng-untouched", o.isUntouched)("ng-touched", o.isTouched)(
                "ng-pristine",
                o.isPristine
              )("ng-dirty", o.isDirty)("ng-valid", o.isValid)(
                "ng-invalid",
                o.isInvalid
              )("ng-pending", o.isPending)("ng-submitted", o.isSubmitted);
          },
          features: [Jt],
        });
      }
    }
    return e;
  })();
var jo = "VALID",
  ra = "INVALID",
  Pr = "PENDING",
  Bo = "DISABLED",
  an = class {},
  aa = class extends an {
    constructor(t, n) {
      super(), (this.value = t), (this.source = n);
    }
  },
  Uo = class extends an {
    constructor(t, n) {
      super(), (this.pristine = t), (this.source = n);
    }
  },
  $o = class extends an {
    constructor(t, n) {
      super(), (this.touched = t), (this.source = n);
    }
  },
  Fr = class extends an {
    constructor(t, n) {
      super(), (this.status = t), (this.source = n);
    }
  },
  Ou = class extends an {
    constructor(t) {
      super(), (this.source = t);
    }
  },
  Pu = class extends an {
    constructor(t) {
      super(), (this.source = t);
    }
  };
function uv(e) {
  return (ha(e) ? e.validators : e) || null;
}
function TS(e) {
  return Array.isArray(e) ? ov(e) : e || null;
}
function dv(e, t) {
  return (ha(t) ? t.asyncValidators : e) || null;
}
function AS(e) {
  return Array.isArray(e) ? iv(e) : e || null;
}
function ha(e) {
  return e != null && !Array.isArray(e) && typeof e == "object";
}
function NS(e, t, n) {
  let r = e.controls;
  if (!(t ? Object.keys(r) : r).length) throw new _(1e3, "");
  if (!r[n]) throw new _(1001, "");
}
function RS(e, t, n) {
  e._forEachChild((r, o) => {
    if (n[o] === void 0) throw new _(1002, "");
  });
}
var ca = class {
    constructor(t, n) {
      (this._pendingDirty = !1),
        (this._hasOwnPendingAsyncValidator = null),
        (this._pendingTouched = !1),
        (this._onCollectionChange = () => {}),
        (this._parent = null),
        (this._status = fo(() => this.statusReactive())),
        (this.statusReactive = lo(void 0)),
        (this._pristine = fo(() => this.pristineReactive())),
        (this.pristineReactive = lo(!0)),
        (this._touched = fo(() => this.touchedReactive())),
        (this.touchedReactive = lo(!1)),
        (this._events = new ve()),
        (this.events = this._events.asObservable()),
        (this._onDisabledChange = []),
        this._assignValidators(t),
        this._assignAsyncValidators(n);
    }
    get validator() {
      return this._composedValidatorFn;
    }
    set validator(t) {
      this._rawValidators = this._composedValidatorFn = t;
    }
    get asyncValidator() {
      return this._composedAsyncValidatorFn;
    }
    set asyncValidator(t) {
      this._rawAsyncValidators = this._composedAsyncValidatorFn = t;
    }
    get parent() {
      return this._parent;
    }
    get status() {
      return St(this.statusReactive);
    }
    set status(t) {
      St(() => this.statusReactive.set(t));
    }
    get valid() {
      return this.status === jo;
    }
    get invalid() {
      return this.status === ra;
    }
    get pending() {
      return this.status == Pr;
    }
    get disabled() {
      return this.status === Bo;
    }
    get enabled() {
      return this.status !== Bo;
    }
    get pristine() {
      return St(this.pristineReactive);
    }
    set pristine(t) {
      St(() => this.pristineReactive.set(t));
    }
    get dirty() {
      return !this.pristine;
    }
    get touched() {
      return St(this.touchedReactive);
    }
    set touched(t) {
      St(() => this.touchedReactive.set(t));
    }
    get untouched() {
      return !this.touched;
    }
    get updateOn() {
      return this._updateOn
        ? this._updateOn
        : this.parent
        ? this.parent.updateOn
        : "change";
    }
    setValidators(t) {
      this._assignValidators(t);
    }
    setAsyncValidators(t) {
      this._assignAsyncValidators(t);
    }
    addValidators(t) {
      this.setValidators(Hm(t, this._rawValidators));
    }
    addAsyncValidators(t) {
      this.setAsyncValidators(Hm(t, this._rawAsyncValidators));
    }
    removeValidators(t) {
      this.setValidators(zm(t, this._rawValidators));
    }
    removeAsyncValidators(t) {
      this.setAsyncValidators(zm(t, this._rawAsyncValidators));
    }
    hasValidator(t) {
      return oa(this._rawValidators, t);
    }
    hasAsyncValidator(t) {
      return oa(this._rawAsyncValidators, t);
    }
    clearValidators() {
      this.validator = null;
    }
    clearAsyncValidators() {
      this.asyncValidator = null;
    }
    markAsTouched(t = {}) {
      let n = this.touched === !1;
      this.touched = !0;
      let r = t.sourceControl ?? this;
      this._parent &&
        !t.onlySelf &&
        this._parent.markAsTouched(U(b({}, t), { sourceControl: r })),
        n && t.emitEvent !== !1 && this._events.next(new $o(!0, r));
    }
    markAllAsTouched(t = {}) {
      this.markAsTouched({
        onlySelf: !0,
        emitEvent: t.emitEvent,
        sourceControl: this,
      }),
        this._forEachChild((n) => n.markAllAsTouched(t));
    }
    markAsUntouched(t = {}) {
      let n = this.touched === !0;
      (this.touched = !1), (this._pendingTouched = !1);
      let r = t.sourceControl ?? this;
      this._forEachChild((o) => {
        o.markAsUntouched({
          onlySelf: !0,
          emitEvent: t.emitEvent,
          sourceControl: r,
        });
      }),
        this._parent && !t.onlySelf && this._parent._updateTouched(t, r),
        n && t.emitEvent !== !1 && this._events.next(new $o(!1, r));
    }
    markAsDirty(t = {}) {
      let n = this.pristine === !0;
      this.pristine = !1;
      let r = t.sourceControl ?? this;
      this._parent &&
        !t.onlySelf &&
        this._parent.markAsDirty(U(b({}, t), { sourceControl: r })),
        n && t.emitEvent !== !1 && this._events.next(new Uo(!1, r));
    }
    markAsPristine(t = {}) {
      let n = this.pristine === !1;
      (this.pristine = !0), (this._pendingDirty = !1);
      let r = t.sourceControl ?? this;
      this._forEachChild((o) => {
        o.markAsPristine({ onlySelf: !0, emitEvent: t.emitEvent });
      }),
        this._parent && !t.onlySelf && this._parent._updatePristine(t, r),
        n && t.emitEvent !== !1 && this._events.next(new Uo(!0, r));
    }
    markAsPending(t = {}) {
      this.status = Pr;
      let n = t.sourceControl ?? this;
      t.emitEvent !== !1 &&
        (this._events.next(new Fr(this.status, n)),
        this.statusChanges.emit(this.status)),
        this._parent &&
          !t.onlySelf &&
          this._parent.markAsPending(U(b({}, t), { sourceControl: n }));
    }
    disable(t = {}) {
      let n = this._parentMarkedDirty(t.onlySelf);
      (this.status = Bo),
        (this.errors = null),
        this._forEachChild((o) => {
          o.disable(U(b({}, t), { onlySelf: !0 }));
        }),
        this._updateValue();
      let r = t.sourceControl ?? this;
      t.emitEvent !== !1 &&
        (this._events.next(new aa(this.value, r)),
        this._events.next(new Fr(this.status, r)),
        this.valueChanges.emit(this.value),
        this.statusChanges.emit(this.status)),
        this._updateAncestors(U(b({}, t), { skipPristineCheck: n }), this),
        this._onDisabledChange.forEach((o) => o(!0));
    }
    enable(t = {}) {
      let n = this._parentMarkedDirty(t.onlySelf);
      (this.status = jo),
        this._forEachChild((r) => {
          r.enable(U(b({}, t), { onlySelf: !0 }));
        }),
        this.updateValueAndValidity({ onlySelf: !0, emitEvent: t.emitEvent }),
        this._updateAncestors(U(b({}, t), { skipPristineCheck: n }), this),
        this._onDisabledChange.forEach((r) => r(!1));
    }
    _updateAncestors(t, n) {
      this._parent &&
        !t.onlySelf &&
        (this._parent.updateValueAndValidity(t),
        t.skipPristineCheck || this._parent._updatePristine({}, n),
        this._parent._updateTouched({}, n));
    }
    setParent(t) {
      this._parent = t;
    }
    getRawValue() {
      return this.value;
    }
    updateValueAndValidity(t = {}) {
      if ((this._setInitialStatus(), this._updateValue(), this.enabled)) {
        let r = this._cancelExistingSubscription();
        (this.errors = this._runValidator()),
          (this.status = this._calculateStatus()),
          (this.status === jo || this.status === Pr) &&
            this._runAsyncValidator(r, t.emitEvent);
      }
      let n = t.sourceControl ?? this;
      t.emitEvent !== !1 &&
        (this._events.next(new aa(this.value, n)),
        this._events.next(new Fr(this.status, n)),
        this.valueChanges.emit(this.value),
        this.statusChanges.emit(this.status)),
        this._parent &&
          !t.onlySelf &&
          this._parent.updateValueAndValidity(
            U(b({}, t), { sourceControl: n })
          );
    }
    _updateTreeValidity(t = { emitEvent: !0 }) {
      this._forEachChild((n) => n._updateTreeValidity(t)),
        this.updateValueAndValidity({ onlySelf: !0, emitEvent: t.emitEvent });
    }
    _setInitialStatus() {
      this.status = this._allControlsDisabled() ? Bo : jo;
    }
    _runValidator() {
      return this.validator ? this.validator(this) : null;
    }
    _runAsyncValidator(t, n) {
      if (this.asyncValidator) {
        (this.status = Pr),
          (this._hasOwnPendingAsyncValidator = { emitEvent: n !== !1 });
        let r = ev(this.asyncValidator(this));
        this._asyncValidationSubscription = r.subscribe((o) => {
          (this._hasOwnPendingAsyncValidator = null),
            this.setErrors(o, { emitEvent: n, shouldHaveEmitted: t });
        });
      }
    }
    _cancelExistingSubscription() {
      if (this._asyncValidationSubscription) {
        this._asyncValidationSubscription.unsubscribe();
        let t = this._hasOwnPendingAsyncValidator?.emitEvent ?? !1;
        return (this._hasOwnPendingAsyncValidator = null), t;
      }
      return !1;
    }
    setErrors(t, n = {}) {
      (this.errors = t),
        this._updateControlsErrors(
          n.emitEvent !== !1,
          this,
          n.shouldHaveEmitted
        );
    }
    get(t) {
      let n = t;
      return n == null ||
        (Array.isArray(n) || (n = n.split(".")), n.length === 0)
        ? null
        : n.reduce((r, o) => r && r._find(o), this);
    }
    getError(t, n) {
      let r = n ? this.get(n) : this;
      return r && r.errors ? r.errors[t] : null;
    }
    hasError(t, n) {
      return !!this.getError(t, n);
    }
    get root() {
      let t = this;
      for (; t._parent; ) t = t._parent;
      return t;
    }
    _updateControlsErrors(t, n, r) {
      (this.status = this._calculateStatus()),
        t && this.statusChanges.emit(this.status),
        (t || r) && this._events.next(new Fr(this.status, n)),
        this._parent && this._parent._updateControlsErrors(t, n, r);
    }
    _initObservables() {
      (this.valueChanges = new de()), (this.statusChanges = new de());
    }
    _calculateStatus() {
      return this._allControlsDisabled()
        ? Bo
        : this.errors
        ? ra
        : this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(Pr)
        ? Pr
        : this._anyControlsHaveStatus(ra)
        ? ra
        : jo;
    }
    _anyControlsHaveStatus(t) {
      return this._anyControls((n) => n.status === t);
    }
    _anyControlsDirty() {
      return this._anyControls((t) => t.dirty);
    }
    _anyControlsTouched() {
      return this._anyControls((t) => t.touched);
    }
    _updatePristine(t, n) {
      let r = !this._anyControlsDirty(),
        o = this.pristine !== r;
      (this.pristine = r),
        this._parent && !t.onlySelf && this._parent._updatePristine(t, n),
        o && this._events.next(new Uo(this.pristine, n));
    }
    _updateTouched(t = {}, n) {
      (this.touched = this._anyControlsTouched()),
        this._events.next(new $o(this.touched, n)),
        this._parent && !t.onlySelf && this._parent._updateTouched(t, n);
    }
    _registerOnCollectionChange(t) {
      this._onCollectionChange = t;
    }
    _setUpdateStrategy(t) {
      ha(t) && t.updateOn != null && (this._updateOn = t.updateOn);
    }
    _parentMarkedDirty(t) {
      let n = this._parent && this._parent.dirty;
      return !t && !!n && !this._parent._anyControlsDirty();
    }
    _find(t) {
      return null;
    }
    _assignValidators(t) {
      (this._rawValidators = Array.isArray(t) ? t.slice() : t),
        (this._composedValidatorFn = TS(this._rawValidators));
    }
    _assignAsyncValidators(t) {
      (this._rawAsyncValidators = Array.isArray(t) ? t.slice() : t),
        (this._composedAsyncValidatorFn = AS(this._rawAsyncValidators));
    }
  },
  la = class extends ca {
    constructor(t, n, r) {
      super(uv(n), dv(r, n)),
        (this.controls = t),
        this._initObservables(),
        this._setUpdateStrategy(n),
        this._setUpControls(),
        this.updateValueAndValidity({
          onlySelf: !0,
          emitEvent: !!this.asyncValidator,
        });
    }
    registerControl(t, n) {
      return this.controls[t]
        ? this.controls[t]
        : ((this.controls[t] = n),
          n.setParent(this),
          n._registerOnCollectionChange(this._onCollectionChange),
          n);
    }
    addControl(t, n, r = {}) {
      this.registerControl(t, n),
        this.updateValueAndValidity({ emitEvent: r.emitEvent }),
        this._onCollectionChange();
    }
    removeControl(t, n = {}) {
      this.controls[t] &&
        this.controls[t]._registerOnCollectionChange(() => {}),
        delete this.controls[t],
        this.updateValueAndValidity({ emitEvent: n.emitEvent }),
        this._onCollectionChange();
    }
    setControl(t, n, r = {}) {
      this.controls[t] &&
        this.controls[t]._registerOnCollectionChange(() => {}),
        delete this.controls[t],
        n && this.registerControl(t, n),
        this.updateValueAndValidity({ emitEvent: r.emitEvent }),
        this._onCollectionChange();
    }
    contains(t) {
      return this.controls.hasOwnProperty(t) && this.controls[t].enabled;
    }
    setValue(t, n = {}) {
      RS(this, !0, t),
        Object.keys(t).forEach((r) => {
          NS(this, !0, r),
            this.controls[r].setValue(t[r], {
              onlySelf: !0,
              emitEvent: n.emitEvent,
            });
        }),
        this.updateValueAndValidity(n);
    }
    patchValue(t, n = {}) {
      t != null &&
        (Object.keys(t).forEach((r) => {
          let o = this.controls[r];
          o && o.patchValue(t[r], { onlySelf: !0, emitEvent: n.emitEvent });
        }),
        this.updateValueAndValidity(n));
    }
    reset(t = {}, n = {}) {
      this._forEachChild((r, o) => {
        r.reset(t ? t[o] : null, { onlySelf: !0, emitEvent: n.emitEvent });
      }),
        this._updatePristine(n, this),
        this._updateTouched(n, this),
        this.updateValueAndValidity(n);
    }
    getRawValue() {
      return this._reduceChildren(
        {},
        (t, n, r) => ((t[r] = n.getRawValue()), t)
      );
    }
    _syncPendingControls() {
      let t = this._reduceChildren(!1, (n, r) =>
        r._syncPendingControls() ? !0 : n
      );
      return t && this.updateValueAndValidity({ onlySelf: !0 }), t;
    }
    _forEachChild(t) {
      Object.keys(this.controls).forEach((n) => {
        let r = this.controls[n];
        r && t(r, n);
      });
    }
    _setUpControls() {
      this._forEachChild((t) => {
        t.setParent(this),
          t._registerOnCollectionChange(this._onCollectionChange);
      });
    }
    _updateValue() {
      this.value = this._reduceValue();
    }
    _anyControls(t) {
      for (let [n, r] of Object.entries(this.controls))
        if (this.contains(n) && t(r)) return !0;
      return !1;
    }
    _reduceValue() {
      let t = {};
      return this._reduceChildren(
        t,
        (n, r, o) => ((r.enabled || this.disabled) && (n[o] = r.value), n)
      );
    }
    _reduceChildren(t, n) {
      let r = t;
      return (
        this._forEachChild((o, i) => {
          r = n(r, o, i);
        }),
        r
      );
    }
    _allControlsDisabled() {
      for (let t of Object.keys(this.controls))
        if (this.controls[t].enabled) return !1;
      return Object.keys(this.controls).length > 0 || this.disabled;
    }
    _find(t) {
      return this.controls.hasOwnProperty(t) ? this.controls[t] : null;
    }
  };
var fv = new M("CallSetDisabledState", {
    providedIn: "root",
    factory: () => Fu,
  }),
  Fu = "always";
function OS(e, t) {
  return [...t.path, e];
}
function Gm(e, t, n = Fu) {
  ku(e, t),
    t.valueAccessor.writeValue(e.value),
    (e.disabled || n === "always") &&
      t.valueAccessor.setDisabledState?.(e.disabled),
    FS(e, t),
    LS(e, t),
    kS(e, t),
    PS(e, t);
}
function qm(e, t, n = !0) {
  let r = () => {};
  t.valueAccessor &&
    (t.valueAccessor.registerOnChange(r), t.valueAccessor.registerOnTouched(r)),
    da(e, t),
    e &&
      (t._invokeOnDestroyCallbacks(), e._registerOnCollectionChange(() => {}));
}
function ua(e, t) {
  e.forEach((n) => {
    n.registerOnValidatorChange && n.registerOnValidatorChange(t);
  });
}
function PS(e, t) {
  if (t.valueAccessor.setDisabledState) {
    let n = (r) => {
      t.valueAccessor.setDisabledState(r);
    };
    e.registerOnDisabledChange(n),
      t._registerOnDestroy(() => {
        e._unregisterOnDisabledChange(n);
      });
  }
}
function ku(e, t) {
  let n = sv(e);
  t.validator !== null
    ? e.setValidators($m(n, t.validator))
    : typeof n == "function" && e.setValidators([n]);
  let r = av(e);
  t.asyncValidator !== null
    ? e.setAsyncValidators($m(r, t.asyncValidator))
    : typeof r == "function" && e.setAsyncValidators([r]);
  let o = () => e.updateValueAndValidity();
  ua(t._rawValidators, o), ua(t._rawAsyncValidators, o);
}
function da(e, t) {
  let n = !1;
  if (e !== null) {
    if (t.validator !== null) {
      let o = sv(e);
      if (Array.isArray(o) && o.length > 0) {
        let i = o.filter((s) => s !== t.validator);
        i.length !== o.length && ((n = !0), e.setValidators(i));
      }
    }
    if (t.asyncValidator !== null) {
      let o = av(e);
      if (Array.isArray(o) && o.length > 0) {
        let i = o.filter((s) => s !== t.asyncValidator);
        i.length !== o.length && ((n = !0), e.setAsyncValidators(i));
      }
    }
  }
  let r = () => {};
  return ua(t._rawValidators, r), ua(t._rawAsyncValidators, r), n;
}
function FS(e, t) {
  t.valueAccessor.registerOnChange((n) => {
    (e._pendingValue = n),
      (e._pendingChange = !0),
      (e._pendingDirty = !0),
      e.updateOn === "change" && hv(e, t);
  });
}
function kS(e, t) {
  t.valueAccessor.registerOnTouched(() => {
    (e._pendingTouched = !0),
      e.updateOn === "blur" && e._pendingChange && hv(e, t),
      e.updateOn !== "submit" && e.markAsTouched();
  });
}
function hv(e, t) {
  e._pendingDirty && e.markAsDirty(),
    e.setValue(e._pendingValue, { emitModelToViewChange: !1 }),
    t.viewToModelUpdate(e._pendingValue),
    (e._pendingChange = !1);
}
function LS(e, t) {
  let n = (r, o) => {
    t.valueAccessor.writeValue(r), o && t.viewToModelUpdate(r);
  };
  e.registerOnChange(n),
    t._registerOnDestroy(() => {
      e._unregisterOnChange(n);
    });
}
function VS(e, t) {
  e == null, ku(e, t);
}
function jS(e, t) {
  return da(e, t);
}
function BS(e, t) {
  if (!e.hasOwnProperty("model")) return !1;
  let n = e.model;
  return n.isFirstChange() ? !0 : !Object.is(t, n.currentValue);
}
function US(e) {
  return Object.getPrototypeOf(e.constructor) === bS;
}
function $S(e, t) {
  e._syncPendingControls(),
    t.forEach((n) => {
      let r = n.control;
      r.updateOn === "submit" &&
        r._pendingChange &&
        (n.viewToModelUpdate(r._pendingValue), (r._pendingChange = !1));
    });
}
function HS(e, t) {
  if (!t) return null;
  Array.isArray(t);
  let n, r, o;
  return (
    t.forEach((i) => {
      i.constructor === fa ? (n = i) : US(i) ? (r = i) : (o = i);
    }),
    o || r || n || null
  );
}
function zS(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
function Wm(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
function Zm(e) {
  return (
    typeof e == "object" &&
    e !== null &&
    Object.keys(e).length === 2 &&
    "value" in e &&
    "disabled" in e
  );
}
var pa = class extends ca {
  constructor(t = null, n, r) {
    super(uv(n), dv(r, n)),
      (this.defaultValue = null),
      (this._onChange = []),
      (this._pendingChange = !1),
      this._applyFormState(t),
      this._setUpdateStrategy(n),
      this._initObservables(),
      this.updateValueAndValidity({
        onlySelf: !0,
        emitEvent: !!this.asyncValidator,
      }),
      ha(n) &&
        (n.nonNullable || n.initialValueIsDefault) &&
        (Zm(t) ? (this.defaultValue = t.value) : (this.defaultValue = t));
  }
  setValue(t, n = {}) {
    (this.value = this._pendingValue = t),
      this._onChange.length &&
        n.emitModelToViewChange !== !1 &&
        this._onChange.forEach((r) =>
          r(this.value, n.emitViewToModelChange !== !1)
        ),
      this.updateValueAndValidity(n);
  }
  patchValue(t, n = {}) {
    this.setValue(t, n);
  }
  reset(t = this.defaultValue, n = {}) {
    this._applyFormState(t),
      this.markAsPristine(n),
      this.markAsUntouched(n),
      this.setValue(this.value, n),
      (this._pendingChange = !1);
  }
  _updateValue() {}
  _anyControls(t) {
    return !1;
  }
  _allControlsDisabled() {
    return this.disabled;
  }
  registerOnChange(t) {
    this._onChange.push(t);
  }
  _unregisterOnChange(t) {
    Wm(this._onChange, t);
  }
  registerOnDisabledChange(t) {
    this._onDisabledChange.push(t);
  }
  _unregisterOnDisabledChange(t) {
    Wm(this._onDisabledChange, t);
  }
  _forEachChild(t) {}
  _syncPendingControls() {
    return this.updateOn === "submit" &&
      (this._pendingDirty && this.markAsDirty(),
      this._pendingTouched && this.markAsTouched(),
      this._pendingChange)
      ? (this.setValue(this._pendingValue, {
          onlySelf: !0,
          emitModelToViewChange: !1,
        }),
        !0)
      : !1;
  }
  _applyFormState(t) {
    Zm(t)
      ? ((this.value = this._pendingValue = t.value),
        t.disabled
          ? this.disable({ onlySelf: !0, emitEvent: !1 })
          : this.enable({ onlySelf: !0, emitEvent: !1 }))
      : (this.value = this._pendingValue = t);
  }
};
var GS = (e) => e instanceof pa;
var pv = (() => {
  class e {
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵdir = je({
        type: e,
        selectors: [["form", 3, "ngNoForm", "", 3, "ngNativeValidate", ""]],
        hostAttrs: ["novalidate", ""],
      });
    }
  }
  return e;
})();
var gv = new M("");
var qS = { provide: kr, useExisting: yr(() => Lu) },
  Lu = (() => {
    class e extends kr {
      get submitted() {
        return St(this._submittedReactive);
      }
      set submitted(n) {
        this._submittedReactive.set(n);
      }
      constructor(n, r, o) {
        super(),
          (this.callSetDisabledState = o),
          (this._submitted = fo(() => this._submittedReactive())),
          (this._submittedReactive = lo(!1)),
          (this._onCollectionChange = () => this._updateDomValue()),
          (this.directives = []),
          (this.form = null),
          (this.ngSubmit = new de()),
          this._setValidators(n),
          this._setAsyncValidators(r);
      }
      ngOnChanges(n) {
        this._checkFormPresent(),
          n.hasOwnProperty("form") &&
            (this._updateValidators(),
            this._updateDomValue(),
            this._updateRegistrations(),
            (this._oldForm = this.form));
      }
      ngOnDestroy() {
        this.form &&
          (da(this.form, this),
          this.form._onCollectionChange === this._onCollectionChange &&
            this.form._registerOnCollectionChange(() => {}));
      }
      get formDirective() {
        return this;
      }
      get control() {
        return this.form;
      }
      get path() {
        return [];
      }
      addControl(n) {
        let r = this.form.get(n.path);
        return (
          Gm(r, n, this.callSetDisabledState),
          r.updateValueAndValidity({ emitEvent: !1 }),
          this.directives.push(n),
          r
        );
      }
      getControl(n) {
        return this.form.get(n.path);
      }
      removeControl(n) {
        qm(n.control || null, n, !1), zS(this.directives, n);
      }
      addFormGroup(n) {
        this._setUpFormContainer(n);
      }
      removeFormGroup(n) {
        this._cleanUpFormContainer(n);
      }
      getFormGroup(n) {
        return this.form.get(n.path);
      }
      addFormArray(n) {
        this._setUpFormContainer(n);
      }
      removeFormArray(n) {
        this._cleanUpFormContainer(n);
      }
      getFormArray(n) {
        return this.form.get(n.path);
      }
      updateModel(n, r) {
        this.form.get(n.path).setValue(r);
      }
      onSubmit(n) {
        return (
          this._submittedReactive.set(!0),
          $S(this.form, this.directives),
          this.ngSubmit.emit(n),
          this.form._events.next(new Ou(this.control)),
          n?.target?.method === "dialog"
        );
      }
      onReset() {
        this.resetForm();
      }
      resetForm(n = void 0) {
        this.form.reset(n),
          this._submittedReactive.set(!1),
          this.form._events.next(new Pu(this.form));
      }
      _updateDomValue() {
        this.directives.forEach((n) => {
          let r = n.control,
            o = this.form.get(n.path);
          r !== o &&
            (qm(r || null, n),
            GS(o) && (Gm(o, n, this.callSetDisabledState), (n.control = o)));
        }),
          this.form._updateTreeValidity({ emitEvent: !1 });
      }
      _setUpFormContainer(n) {
        let r = this.form.get(n.path);
        VS(r, n), r.updateValueAndValidity({ emitEvent: !1 });
      }
      _cleanUpFormContainer(n) {
        if (this.form) {
          let r = this.form.get(n.path);
          r && jS(r, n) && r.updateValueAndValidity({ emitEvent: !1 });
        }
      }
      _updateRegistrations() {
        this.form._registerOnCollectionChange(this._onCollectionChange),
          this._oldForm && this._oldForm._registerOnCollectionChange(() => {});
      }
      _updateValidators() {
        ku(this.form, this), this._oldForm && da(this._oldForm, this);
      }
      _checkFormPresent() {
        this.form;
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(X(Km, 10), X(Xm, 10), X(fv, 8));
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [["", "formGroup", ""]],
          hostBindings: function (r, o) {
            r & 1 &&
              vt("submit", function (s) {
                return o.onSubmit(s);
              })("reset", function () {
                return o.onReset();
              });
          },
          inputs: { form: [0, "formGroup", "form"] },
          outputs: { ngSubmit: "ngSubmit" },
          exportAs: ["ngForm"],
          features: [xs([qS]), Jt, Zt],
        });
      }
    }
    return e;
  })();
var WS = { provide: Ho, useExisting: yr(() => Vu) },
  Vu = (() => {
    class e extends Ho {
      set isDisabled(n) {}
      static {
        this._ngModelWarningSentOnce = !1;
      }
      constructor(n, r, o, i, s) {
        super(),
          (this._ngModelWarningConfig = s),
          (this._added = !1),
          (this.name = null),
          (this.update = new de()),
          (this._ngModelWarningSent = !1),
          (this._parent = n),
          this._setValidators(r),
          this._setAsyncValidators(o),
          (this.valueAccessor = HS(this, i));
      }
      ngOnChanges(n) {
        this._added || this._setUpControl(),
          BS(n, this.viewModel) &&
            ((this.viewModel = this.model),
            this.formDirective.updateModel(this, this.model));
      }
      ngOnDestroy() {
        this.formDirective && this.formDirective.removeControl(this);
      }
      viewToModelUpdate(n) {
        (this.viewModel = n), this.update.emit(n);
      }
      get path() {
        return OS(
          this.name == null ? this.name : this.name.toString(),
          this._parent
        );
      }
      get formDirective() {
        return this._parent ? this._parent.formDirective : null;
      }
      _checkParentType() {}
      _setUpControl() {
        this._checkParentType(),
          (this.control = this.formDirective.addControl(this)),
          (this._added = !0);
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)(
            X(kr, 13),
            X(Km, 10),
            X(Xm, 10),
            X(Qm, 10),
            X(gv, 8)
          );
        };
      }
      static {
        this.ɵdir = je({
          type: e,
          selectors: [["", "formControlName", ""]],
          inputs: {
            name: [0, "formControlName", "name"],
            isDisabled: [0, "disabled", "isDisabled"],
            model: [0, "ngModel", "model"],
          },
          outputs: { update: "ngModelChange" },
          features: [xs([WS]), Jt, Zt],
        });
      }
    }
    return e;
  })();
var ZS = (() => {
  class e {
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵmod = _n({ type: e });
    }
    static {
      this.ɵinj = In({});
    }
  }
  return e;
})();
var mv = (() => {
  class e {
    static withConfig(n) {
      return {
        ngModule: e,
        providers: [
          { provide: gv, useValue: n.warnOnNgModelWithFormControl ?? "always" },
          { provide: fv, useValue: n.callSetDisabledState ?? Fu },
        ],
      };
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵmod = _n({ type: e });
    }
    static {
      this.ɵinj = In({ imports: [ZS] });
    }
  }
  return e;
})();
var vv = { API_URL: "http://192.168.0.180/api" };
var yv = (() => {
  class e {
    constructor() {
      (this.httpClient = y(jl)), (this.baseUrl = `${vv.API_URL}`);
    }
    login(n) {
      return Qa(this.httpClient.post(`${this.baseUrl}/login`, n));
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵprov = S({ token: e, factory: e.ɵfac, providedIn: "root" });
    }
  }
  return e;
})();
var wv = $d(Bu());
var Dv = (() => {
  class e {
    constructor() {
      (this.formLogin = new la({ usuario: new pa(), password: new pa() })),
        (this.autenservice = y(yv)),
        (this.router = y(Rt));
    }
    onSubmit() {
      return Hn(this, null, function* () {
        try {
          let n = yield this.autenservice.login(this.formLogin.value);
          localStorage.setItem("token_proyecto", n.token),
            this.router.navigateByUrl("/home");
        } catch ({ error: n }) {
          wv.default.fire("Error", n.message, "error");
        }
      });
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵcmp = We({
        type: e,
        selectors: [["app-login"]],
        standalone: !0,
        features: [Ye],
        decls: 20,
        vars: 1,
        consts: [
          [
            1,
            "wrapper",
            "d-flex",
            "justify-content-center",
            "login-wrapper",
            "bg-body",
            "flex-column",
            "p-3",
            "align-items-center",
          ],
          [
            "src",
            "./img/logoredecom.png",
            "alt",
            "logo",
            1,
            "img-fluid",
            "logo",
          ],
          [1, "fw-light", "text-center", "mt-4"],
          [1, "fw-bold"],
          [1, "fw-light", "text-center"],
          [3, "ngSubmit", "formGroup"],
          [1, "my-2", "fw-light"],
          [
            "formControlName",
            "usuario",
            "type",
            "text",
            "id",
            "usuario",
            "name",
            "usuario",
            "placeholder",
            "Tu usuario",
            1,
            "form-control",
          ],
          [
            "formControlName",
            "password",
            "type",
            "password",
            "id",
            "password",
            "name",
            "password",
            "autocomplete",
            "on",
            "placeholder",
            "Tu contrase\xF1a",
            1,
            "form-control",
          ],
          [1, "mt-4", "mb-3", "fw-semibold"],
          ["type", "submit", "value", "Entrar", 1, "button-primary"],
          ["role", "status", 1, "spinner-grow"],
          [1, "sr-only"],
        ],
        template: function (r, o) {
          r & 1 &&
            (Q(0, "main")(1, "section", 0)(2, "div"),
            J(3, "img", 1),
            Q(4, "h1")(5, "p", 2)(6, "span", 3),
            ot(7, "\xA1bienvenido!"),
            te()(),
            Q(8, "p", 4),
            ot(9, "Inicia Sesion"),
            te()(),
            Q(10, "form", 5),
            vt("ngSubmit", function () {
              return o.onSubmit();
            }),
            Q(11, "div", 6),
            J(12, "input", 7),
            te(),
            Q(13, "div", 6),
            J(14, "input", 8),
            te(),
            Q(15, "div", 9),
            J(16, "input", 10),
            te()()(),
            Q(17, "div", 11)(18, "span", 12),
            ot(19, "Loading..."),
            te()()()()),
            r & 2 && (Es(10), uo("formGroup", o.formLogin));
        },
        dependencies: [mv, pv, fa, cv, lv, Lu, Vu],
        styles: [
          '@font-face{font-family:Work Sans;font-style:italic;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYqz_wNahGAdqQ43Rh_eZDkv_1w4A.woff2) format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:Work Sans;font-style:italic;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYqz_wNahGAdqQ43Rh_eZDlv_1w4A.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:Work Sans;font-style:italic;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYqz_wNahGAdqQ43Rh_eZDrv_0.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:Work Sans;font-style:normal;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYsz_wNahGAdqQ43Rh_c6Dpp_k.woff2) format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:Work Sans;font-style:normal;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYsz_wNahGAdqQ43Rh_cqDpp_k.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:Work Sans;font-style:normal;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/s/worksans/v19/QGYsz_wNahGAdqQ43Rh_fKDp.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}section[_ngcontent-%COMP%]{font-family:Work Sans,sans-serif}input[_ngcontent-%COMP%]{background-color:#f6f6f6}.button-primary[_ngcontent-%COMP%]{background-color:var(--color-button1);color:#fff}img[_ngcontent-%COMP%]{width:20rem}a[_ngcontent-%COMP%]{color:#000;font-weight:500}.alert-box[_ngcontent-%COMP%]{background-color:#fff;border:1px solid #ccc;border-radius:5px;padding:20px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 4px 10px #0003;z-index:1000}.alert[_ngcontent-%COMP%]{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#0000001a}.alert-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{margin:10px 0;padding:.5em;width:100%}.alert-box[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin-top:10px}.buttons-forgetpassword[_ngcontent-%COMP%]{display:flex;justify-content:space-between;align-items:center}.b-forgetpassword-send[_ngcontent-%COMP%]{background-color:var(--color-button1);color:var(--color-text-secondary);padding:.5em 1em;border:none;border-radius:3px;cursor:pointer;transition:background-color .5s ease,box-shadow .5s ease}.b-forgetpassword-send[_ngcontent-%COMP%]:hover{box-shadow:0 4px 8px #0003}.b-forgetpassword-close[_ngcontent-%COMP%]{background-color:var(--color-button3);color:var(--color-text-secondary);padding:.5em 1em;border:none;border-radius:3px;cursor:pointer}.login-wrapper[_ngcontent-%COMP%]{min-height:calc(100vh - 148px)}.error-box[_ngcontent-%COMP%]{height:21px}@media (min-width: 390px) and (max-width: 767px){.alert-box[_ngcontent-%COMP%]{width:80%}}',
        ],
      });
    }
  }
  return e;
})();
var QS = () => ["/home"],
  bv = (() => {
    class e {
      constructor() {
        this.router = y(Rt);
      }
      onClickLogout() {
        localStorage.removeItem("token_proyecto"),
          this.router.navigateByUrl("/login");
      }
      static {
        this.ɵfac = function (r) {
          return new (r || e)();
        };
      }
      static {
        this.ɵcmp = We({
          type: e,
          selectors: [["app-sidebar"]],
          standalone: !0,
          features: [Ye],
          decls: 28,
          vars: 2,
          consts: [
            [1, "menu"],
            [1, "fa-solid", "fa-bars"],
            [1, "sidebar"],
            [1, "div1", "my-2"],
            [
              "src",
              "./img/logoredecom.png",
              "alt",
              "logo",
              1,
              "img-fluid",
              "logo",
              3,
              "routerLink",
            ],
            [1, "div2", "my-2"],
            [1, "button-primary", "my-2"],
            [1, "fa-solid", "fa-gear"],
            [1, "fa-solid", "fa-box-open"],
            [1, "fa-solid", "fa-circle-nodes"],
            [1, "fa-solid", "fa-screwdriver-wrench"],
            [1, "div3", "buton-bottom"],
            [1, "button-primary", "usuario", "my-2"],
            [1, "fa-regular", "fa-user"],
            [1, "button-primary", "usuario", "my-2", 3, "click"],
            [1, "fa-solid", "fa-right-from-bracket"],
          ],
          template: function (r, o) {
            r & 1 &&
              (Q(0, "div", 0),
              J(1, "i", 1),
              te(),
              Q(2, "div", 2)(3, "div", 3)(4, "a"),
              J(5, "img", 4),
              te()(),
              J(6, "hr"),
              Q(7, "div", 5)(8, "button", 6),
              J(9, "i", 7),
              ot(10, " Sistema "),
              te(),
              Q(11, "button", 6),
              J(12, "i", 8),
              ot(13, " Bodega "),
              te(),
              Q(14, "button", 6),
              J(15, "i", 9),
              ot(16, " Noc "),
              te(),
              Q(17, "button", 6),
              J(18, "i", 10),
              ot(19, " Tecnico "),
              te()(),
              Q(20, "div", 11),
              J(21, "hr"),
              Q(22, "button", 12),
              J(23, "i", 13),
              ot(24, " Usuario "),
              te(),
              Q(25, "button", 14),
              vt("click", function () {
                return o.onClickLogout();
              }),
              J(26, "i", 15),
              ot(27, " Cerrar Sesion "),
              te()()()),
              r & 2 && (Es(5), uo("routerLink", vg(1, QS)));
          },
          dependencies: [jm],
          styles: [
            "[_ngcontent-%COMP%]:root{--color-barra-lateral: rgb(255, 255, 255);--color-texto: rgb(0, 0, 0);--color-texto-menu: rgb(134: 136: 144);--color-boton: rgb(0, 0, 0);--color-boton-texto: rgb(255, 255, 255)}*[_ngcontent-%COMP%]{margin:0;padding:0;box-sizing:border-box}.sidebar[_ngcontent-%COMP%]{display:flex;flex-direction:column;justify-content:space-between;width:250px;height:100%;padding:20px;background-color:var(--color-barra-lateral)}.logo[_ngcontent-%COMP%]{max-width:40vw;object-fit:contain;height:40px;cursor:pointer}.div2[_ngcontent-%COMP%]{overflow-y:auto}.buton-bottom[_ngcontent-%COMP%]{margin-top:auto;bottom:10px;width:100%}.menu[_ngcontent-%COMP%]{color:red;width:50px;height:50px;position:fixed;font-size:30px;justify-content:center;align-items:center;cursor:pointer;right:15px;top:15px;display:none}@media (max-width: 600px){.sidebar[_ngcontent-%COMP%]{position:absolute;left:-250px}.menu[_ngcontent-%COMP%]{display:flex}}",
          ],
        });
      }
    }
    return e;
  })();
var Cv = (() => {
  class e {
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵcmp = We({
        type: e,
        selectors: [["app-contenido"]],
        standalone: !0,
        features: [Ye],
        decls: 3,
        vars: 0,
        consts: [[1, "full-screen-vertical"]],
        template: function (r, o) {
          r & 1 && (Q(0, "div", 0)(1, "section"), J(2, "app-sidebar"), te()());
        },
        dependencies: [bv],
        styles: [
          ".full-screen-vertical[_ngcontent-%COMP%]{height:100vh}section[_ngcontent-%COMP%]{height:100%}",
        ],
      });
    }
  }
  return e;
})();
var Ev = (() => {
  class e {
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵcmp = We({
        type: e,
        selectors: [["app-home"]],
        standalone: !0,
        features: [Ye],
        decls: 3,
        vars: 0,
        template: function (r, o) {
          r & 1 && (Q(0, "main")(1, "section"), J(2, "app-contenido"), te()());
        },
        dependencies: [Cv],
      });
    }
  }
  return e;
})();
var Iv = $d(Bu()),
  _v = (e, t) => {
    let n = y(Rt);
    return localStorage.getItem("token_proyecto")
      ? !0
      : (Iv.default.fire("Error", "Debes estar autenticado", "warning"),
        n.navigateByUrl("/login"),
        !1);
  };
var Mv = [
  { path: "", pathMatch: "full", redirectTo: "login" },
  { path: "login", component: Dv },
  { path: "home", component: Ev, canActivate: [_v] },
];
var Sv = (e, t) => {
  let n = localStorage.getItem("token_proyecto");
  if (n) {
    let r = e.clone({ headers: e.headers.set("Authorization", n) });
    return t(r);
  }
  return t(e);
};
var xv = {
  providers: [Eg({ eventCoalescing: !0 }), Bm(Mv, Um()), qg(Wg([Sv]))],
};
var Tv = (() => {
  class e {
    constructor() {
      this.title = "Frontend";
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵcmp = We({
        type: e,
        selectors: [["app-root"]],
        standalone: !0,
        features: [Ye],
        decls: 2,
        vars: 0,
        template: function (r, o) {
          r & 1 && (Q(0, "main"), J(1, "router-outlet"), te());
        },
        dependencies: [Su],
      });
    }
  }
  return e;
})();
tm(Tv, xv).catch((e) => console.error(e));
