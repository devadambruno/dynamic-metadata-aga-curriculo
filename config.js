export const config = {
  //domainSource: "https://argologerenciadoraacervos.com.br", // Your WeWeb app preview link
	domainSource: "https://argologerenciadoraacervos.weweb.io"
  patterns: [
      {
          pattern: "/perfilpublico/[^/]+",
          metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramuser}/metadata"
      }
      // Add more patterns and their metadata endpoints as needed
  ]
};
