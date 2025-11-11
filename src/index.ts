import { config } from '../config.js';



export default {
  async fetch(request, env, ctx) {
    // Extracting configuration values
    const domainSource = config.domainSource;
    const patterns = config.patterns;

    console.log("Worker started");

    // Parse the request URL
    const url = new URL(request.url);
    const referer = request.headers.get('Referer')


	     // 🖼️ Proxy de imagem (corrige bloqueios do Xano, Cloudflare e WhatsApp)
  if (url.pathname.startsWith("/shareimg/")) {
  const rawPath = url.pathname
  .replace("/shareimg/", "")
  .replace(/^\/+/, "")


// codifica espaços e caracteres perigosos
const safePath = rawPath.replace(/ /g, "%20");
	
    const targetUrl = `https://api.argologerenciadoraacervos.com.br/vault/${safePath}`;

    console.log("🔗 Proxying image from Xano API:", targetUrl);

    try {
      const imageResponse = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ArgologerenciadoraBot/1.0)",
          "Accept": "image/*"
        }
      });

      if (!imageResponse.ok) {
        console.log("⚠️ Erro ao buscar imagem:", imageResponse.status);
        return new Response(`Erro ao buscar imagem (${imageResponse.status})`, { status: imageResponse.status });
      }

      return new Response(imageResponse.body, {
        status: 200,
        headers: {
          "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      console.log("❌ Erro no proxy:", err);
      return new Response("Erro interno no proxy de imagem", { status: 500 });
    }
  }

 


	// 🟢 BYPASS para evitar loop quando o parâmetro ?origin=bypass estiver presente
    if (url.searchParams.has("origin")) {
      console.log("Bypass ativo — retornando conteúdo original da WeWeb");
      return fetch(request);
    }

    // Function to get the pattern configuration that matches the URL
    function getPatternConfig(url) {
      for (const patternConfig of patterns) {
        const regex = new RegExp(patternConfig.pattern);
        let pathname = url + (url.endsWith('/') ? '' : '/');
        if (regex.test(pathname)) {
          return patternConfig;
        }
      }
      return null;
    }

    // Function to check if the URL matches the page data pattern (For the WeWeb app)
    function isPageData(url) {
      const pattern = /\/public\/data\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.json/;
      return pattern.test(url);
    }

async function requestMetadata(url, metaDataEndpoint) {
  // Remove trailing slash do final da URL (caso exista)
  const trimmedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const parts = trimmedUrl.split('/');
  const id = parts[parts.length - 1];

  // Substitui o placeholder {paramuser} pelo ID real
  const placeholderPattern = /{([^}]+)}/;
  const metaDataEndpointWithId = metaDataEndpoint.replace(placeholderPattern, id);

  console.log("🔗 Fetching metadata from:", metaDataEndpointWithId);

  try { 
    const metaDataResponse = await fetch(metaDataEndpointWithId, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    // Loga status da requisição
    console.log("Metadata response status:", metaDataResponse.status);

    const metadata = await metaDataResponse.json();
    console.log("✅ Metadata fetched:", metadata);

	if (metadata && metadata.return) {
  		return metadata.return;
	}

	  return metadata;
	  
  } catch (error) {
    console.log("❌ Error fetching metadata:", error);
    return {};
  }
}


    // Handle dynamic page requests
    const patternConfig = getPatternConfig(url.pathname);
    if (patternConfig) {
      console.log("Dynamic page detected:", url.pathname);

      // Fetch the source page content
      let source = await fetch(`${domainSource}${url.pathname}`);

      // Remove "X-Robots-Tag" from the headers
      const sourceHeaders = new Headers(source.headers);
      sourceHeaders.delete('X-Robots-Tag');
      source = new Response(source.body, {
        status: source.status,
        headers: sourceHeaders
      });

      const metadata = await requestMetadata(url.pathname, patternConfig.metaDataEndpoint);
		// Novo codigo

		

// 🟣 Se o User-Agent for de um crawler (LinkedIn, Facebook, WhatsApp), retorna HTML pré-renderizado
const userAgent = request.headers.get("User-Agent") || "";
if (/facebookexternalhit|LinkedInBot|WhatsApp|Slackbot|Twitterbot|TelegramBot/i.test(userAgent)) {
  console.log("🤖 Detected crawler bot:", userAgent);

  // Evita loop do Cloudflare adicionando ?origin=bypass
  let html;
  try {
    html = await (await fetch(`${domainSource}${url.pathname}?origin=bypass`)).text();
  } catch (err) {
    console.log("❌ Erro ao buscar HTML da origem:", err);
    return new Response("Erro ao buscar origem.", { status: 502 });
  }

   // 🔐 Garante que metadata é sempre definido
  const safeMeta = metadata || {};
  safeMeta.title = safeMeta.title || "";
  safeMeta.description = safeMeta.description || "";
  safeMeta.image = safeMeta.image || "";

  // —— COLE AQUI: forçar proxy para imagens (evita 403/CloudFront/WhatsApp)
  // —— Corrige e força domínio fixo do Google Storage
if (safeMeta.image) {
  console.log("🧩 Imagem original recebida:", safeMeta.image);

  // Remove ../ e espaços inseguros
  let cleanedPath = safeMeta.image
    .replace(/ /g, "%20");

  // Extrai apenas o trecho após /vault/
  const vaultIndex = cleanedPath.indexOf("/vault/");
  if (vaultIndex !== -1) {
    cleanedPath = cleanedPath.substring(vaultIndex + "/vault/".length);
  } else if (cleanedPath.startsWith("vault/")) {
    cleanedPath = cleanedPath.substring("vault/".length);
  }

  // Monta a URL final fixa para o domínio GCS
  const baseVaultUrl = "https://storage.googleapis.com/xcsx-77bw-5url.n7c.xano.io/vault/";
  safeMeta.image = baseVaultUrl + cleanedPath;

  console.log("✅ Imagem reescrita:", safeMeta.image);
}




  // 🔍 Detecta tipo de imagem dinamicamente
  const lowerImage = safeMeta.image.toLowerCase();
  if (lowerImage.endsWith(".png")) safeMeta.imageType = "image/png";
  else if (lowerImage.endsWith(".webp")) safeMeta.imageType = "image/webp";
  else if (lowerImage.endsWith(".gif")) safeMeta.imageType = "image/gif";
  else safeMeta.imageType = "image/jpeg";

// Injeta meta tags com segurança
try {
  // 🧼 Remove query string da imagem (WhatsApp não gosta de '?')
  if (safeMeta.image && safeMeta.image.includes("?")) {
    safeMeta.image = safeMeta.image.split("?")[0];
  }

  html = html
    .replace(/<meta property="og:title".*?>/, `<meta property="og:title" content="${safeMeta.title}">`)
    .replace(/<meta property="og:description".*?>/, `<meta property="og:description" content="${safeMeta.description}">`)
    .replace(/<meta property="og:image".*?>/, `
      <meta property="og:image" content="${safeMeta.image}">
      <meta property="og:image:secure_url" content="${safeMeta.image}">
      <meta property="og:image:width" content="800">
      <meta property="og:image:height" content="420">
      <meta property="og:image:type" content="${safeMeta.imageType}">
    `)
    // 🔗 Adiciona og:url, og:type e og:site_name antes do fechamento do </head>
    .replace(/<\/head>/i, `
      <meta property="og:url" content="${url.href}">
      <meta property="og:type" content="website">
      <meta property="og:site_name" content="Argo Log Gerenciadora de Acervos">
    </head>`);
} catch (err) {
  console.log("⚠️ Erro ao injetar meta tags:", err);
}


  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
}



		// fim


		
      console.log("Metadata fetched:", metadata);


		
      // Create a custom header handler with the fetched metadata
      const customHeaderHandler = new CustomHeaderHandler(metadata);

      // Transform the source HTML with the custom headers
      return new HTMLRewriter()
        .on('*', customHeaderHandler)
        .transform(source);

    // Handle page data requests for the WeWeb app
    } else if (isPageData(url.pathname)) {
      	console.log("Page data detected:", url.pathname);
	console.log("Referer:", referer);

      // Fetch the source data content
      const sourceResponse = await fetch(`${domainSource}${url.pathname}`);
      let sourceData = await sourceResponse.json();

      let pathname = referer;
      pathname = pathname ? pathname + (pathname.endsWith('/') ? '' : '/') : null;
      if (pathname !== null) {
        const patternConfigForPageData = getPatternConfig(pathname);
        if (patternConfigForPageData) {
          const metadata = await requestMetadata(pathname, patternConfigForPageData.metaDataEndpoint);
          console.log("Metadata fetched:", metadata);

          // Ensure nested objects exist in the source data
          sourceData.page = sourceData.page || {};
          sourceData.page.title = sourceData.page.title || {};
          sourceData.page.meta = sourceData.page.meta || {};
          sourceData.page.meta.desc = sourceData.page.meta.desc || {};
          sourceData.page.meta.keywords = sourceData.page.meta.keywords || {};
          sourceData.page.socialTitle = sourceData.page.socialTitle || {};
          sourceData.page.socialDesc = sourceData.page.socialDesc || {};

          // Update source data with the fetched metadata
          if (metadata.title) {
            sourceData.page.title.en = metadata.title;
            sourceData.page.socialTitle.en = metadata.title;
          }
          if (metadata.description) {
            sourceData.page.meta.desc.en = metadata.description;
            sourceData.page.socialDesc.en = metadata.description;
          }
          if (metadata.image) {
            sourceData.page.metaImage = metadata.image;
          }
          if (metadata.keywords) {
            sourceData.page.meta.keywords.en = metadata.keywords;
          }

	  console.log("returning file: ", JSON.stringify(sourceData));
          // Return the modified JSON object
          return new Response(JSON.stringify(sourceData), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // If the URL does not match any patterns, fetch and return the original content
    console.log("Fetching original content for:", url.pathname);
    const sourceUrl = new URL(`${domainSource}${url.pathname}`);
    const sourceRequest = new Request(sourceUrl, request);
    const sourceResponse = await fetch(sourceRequest);

    // Create a new response without the "X-Robots-Tag" header
    const modifiedHeaders = new Headers(sourceResponse.headers);
    modifiedHeaders.delete('X-Robots-Tag');

    return new Response(sourceResponse.body, {
      status: sourceResponse.status,
      headers: modifiedHeaders,
    });
  }
};

// CustomHeaderHandler class to modify HTML content based on metadata
// CustomHeaderHandler class to modify HTML content based on metadata
class CustomHeaderHandler {
  constructor(metadata) {
    this.metadata = metadata;
  }

  element(element) {
    // Replace <title>
    if (element.tagName === "title" && this.metadata.title) {
      element.setInnerContent(this.metadata.title);
    }

    // Atualiza <meta> existentes
    if (element.tagName === "meta") {
      const name = element.getAttribute("name");
      const property = element.getAttribute("property");
      const itemprop = element.getAttribute("itemprop");

      // Atualiza meta[name]
      switch (name) {
        case "title":
        case "twitter:title":
          element.setAttribute("content", this.metadata.title);
          break;
        case "description":
        case "twitter:description":
          element.setAttribute("content", this.metadata.description);
          break;
        case "image":
        case "twitter:image":
          element.setAttribute("content", this.metadata.image);
          break;
        case "keywords":
          element.setAttribute("content", this.metadata.keywords);
          break;
      }

      // Atualiza meta[itemprop]
      switch (itemprop) {
        case "name":
          element.setAttribute("content", this.metadata.title);
          break;
        case "description":
          element.setAttribute("content", this.metadata.description);
          break;
        case "image":
          element.setAttribute("content", this.metadata.image);
          break;
      }

      // Atualiza meta[property] (Open Graph)
      switch (property) {
        case "og:title":
          element.setAttribute("content", this.metadata.title);
          break;
        case "og:description":
          element.setAttribute("content", this.metadata.description);
          break;
        case "og:image":
          element.setAttribute("content", this.metadata.image);
          break;
        case "og:url":
          element.setAttribute("content", this.metadata.url || "");
          break;
        case "og:type":
          element.setAttribute("content", "website");
          break;
        case "og:site_name":
          element.setAttribute("content", "Argo Log Gerenciadora de Acervos");
          break;
      }

      // Remove "noindex"
      if (name === "robots" && element.getAttribute("content") === "noindex") {
        element.remove();
      }
    }

    // ✅ Se o HTML não tinha as metas OG, injeta manualmente antes do fechamento de </head>
    if (element.tagName === "head") {
      element.append(`
        <meta property="og:title" content="${this.metadata.title}">
        <meta property="og:description" content="${this.metadata.description}">
        <meta property="og:image" content="${this.metadata.image}">
        <meta property="og:image:secure_url" content="${this.metadata.image}">
        <meta property="og:image:width" content="800">
        <meta property="og:image:height" content="420">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:url" content="${this.metadata.url || ""}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Argo Log Gerenciadora de Acervos">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${this.metadata.title}">
        <meta name="twitter:description" content="${this.metadata.description}">
        <meta name="twitter:image" content="${this.metadata.image}">
      `, { html: true });
    }
  }
}


