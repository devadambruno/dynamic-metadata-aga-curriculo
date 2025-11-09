export const config = {
  //domainSource: "https://argologerenciadoraacervos.com.br", // Your WeWeb app preview link
 	domainSource: "https://www.argologerenciadoraacervos.com.br", //?origin=bypass",
  patterns: [
      {
          //pattern: "/perfilpublico/[^/]+",
		  pattern: "^/perfilpublico/[^/]+/?$",
          metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramuser}/metadata"
      }
      // Add more patterns and their metadata endpoints as needed
  ]
};
