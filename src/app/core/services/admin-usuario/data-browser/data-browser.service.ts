import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataBrowserService {
  //-----------------------------------------------------------------
  // Metodos para validar datos del navegador
  //-----------------------------------------------------------------

  // Devuelve el agente de usuario del navegador
  getUserAgent = (): string => {
    return navigator.userAgent;
  }

  // Devuelve la versión del navegador extraída de la cadena de agente de usuario
  getUserAgentValue(userAgent: string, browserName: string): string {
    const versionIndex = userAgent.indexOf(browserName) + browserName.length + 1;
    const versionString = userAgent.substring(versionIndex);
    const endIndex = versionString.indexOf(' ');
    return endIndex !== -1 ? versionString.substring(0, endIndex) : versionString;
  }

  // Devuelve el nombre del dispositivo basado en el agente de usuario
  getDeviceName(): string {
    const userAgent = navigator.userAgent;

    if (/iPhone/i.exec(userAgent)) {
      return 'iPhone';
    }

    else if (/iPad/i.exec(userAgent)) {
      return 'iPad';
    }

    else if (/Android/i.exec(userAgent)) {
      return 'Android';
    }

    else if (/Windows/i.exec(userAgent)) {
      return 'Windows';
    }

    else if (/Mac/i.exec(userAgent)) {
      return 'Mac';
    }

    else {
      return 'Desconocido';
    }
  }


  // Devuelve la versión del sistema operativo extraída del agente de usuario
  getOSVersion(): string {
    const userAgent = window.navigator.userAgent;

    if (userAgent.indexOf('Windows NT') !== -1) {
      return this.getUserAgentValue(userAgent, 'Windows NT');
    }

    else if (userAgent.indexOf('Android') !== -1) {
      return this.getUserAgentValue(userAgent, 'Android');
    }

    else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) {
      const versionIndex = userAgent.indexOf('OS ') + 3;
      const versionString = userAgent.substring(versionIndex);
      const endIndex = versionString.indexOf(' ');
      return versionString.substring(0, endIndex);
    }

    else if (userAgent.indexOf('Mac OS X') !== -1) {
      return this.getUserAgentValue(userAgent, 'Mac OS X');
    }

    else {
      return 'Desconocido';
    }
  } 

  // Devuelve el nombre del navegador basado en el agente de usuario
  getBrowserName(): string {
    const userAgent: string = navigator.userAgent;
    let browserName: string = "Unknown";

    // Lista de expresiones regulares para detectar diferentes navegadores
    const browserRegexMap: [RegExp, string][] = [
      [/\bOpera\b/, "Opera"],
      [/\bOPR\b/, "Opera"],
      [/\bEdg\b/, "Microsoft Edge"],
      [/\bMSIE\b/, "Microsoft Internet Explorer"],
      [/\bTrident\b/, "Microsoft Internet Explorer"],// IE 11 y superior
      [/\bChrome\b/, "Google Chrome"],
      [/\bSafari\b/, "Safari"],
      [/\bFirefox\b/, "Mozilla Firefox"],
    ];

    for (const [regex, name] of browserRegexMap) {
      if (regex.test(userAgent)) {
        browserName = name;
        break;
      }
    }

    // Detección especial para los que usan Chrome como motor pero no son Chrome
    if (browserName === "Google Chrome") {
      if (/Edg\//.test(userAgent)) {
        browserName = "Microsoft Edge";
      }

      else if (/OPR\//.test(userAgent)) {
        browserName = "Opera";
      }

      else if (/CriOS\//.test(userAgent)) {
        browserName = "Chrome en iOS";
      }
    }

    else if (browserName === "Safari" && /Version\//.test(userAgent)) {
      if (/Mobile\//.test(userAgent)) {
        browserName = "Safari en iOS";
      }
    }

    return browserName;
  }

  // Devuelve la versión del navegador basada en el agente de usuario
  getBrowserVersion(): string {
    const userAgent: string = navigator.userAgent;
    let browserVersion: string = "Unknown";
    let browserName: string = "Unknown";

    const browserRegexMap: [RegExp, string][] = [
      [/\bOpera\b/, "Opera"],
      [/\bOPR\b/, "Opera"],
      [/\bEdg\/(\d+)/, "Microsoft Edge"],
      [/\bMSIE\s(\d+)/, "Microsoft Internet Explorer"],
      [/\bTrident\/.*rv:(\d+)/, "Microsoft Internet Explorer"], // IE 11 y superior
      [/\bChrome\/(\d+)/, "Google Chrome"],
      [/\bSafari\/(\d+)/, "Safari"],
      [/\bFirefox\/(\d+)/, "Mozilla Firefox"],
    ];

    for (const [regex, name] of browserRegexMap) {
      const matches = regex.exec(userAgent);
      if (matches) {
        browserName = name;
        browserVersion = matches[1]; // Captura la versión que es el primer grupo de captura en cada regex.
        break;
      }
    }

    // Detección especial para los que usan Chrome como motor pero no son Chrome
    if (browserName === "Google Chrome") {
      const edgeVersionMatch = /\bEdg\/(\d+)/.exec(userAgent);
      if (edgeVersionMatch) {
        return `Microsoft Edge Version: ${edgeVersionMatch[1]}`;
      }

      const operaVersionMatch = /\bOPR\/(\d+)/.exec(userAgent);
      if (operaVersionMatch) {
        return `Opera Version: ${operaVersionMatch[1]}`;
      }

      const criOSVersionMatch = /\bCriOS\/(\d+)/.exec(userAgent);
      if (criOSVersionMatch) {
        return `Chrome en iOS Version: ${criOSVersionMatch[1]}`;
      }
    }

    else if (browserName === "Safari") {
      const safariVersionMatch = /\bVersion\/(\d+)/.exec(userAgent);

      if (safariVersionMatch) {
        return `Safari Version: ${safariVersionMatch[1]}`;
      }
    }

    return browserName !== "Unknown" ? `${browserVersion}` : "Desconocido";
  }

  //-----------------------------------------------------------------
  // Metodos para validar datos del navegador. END
  //-----------------------------------------------------------------
}
