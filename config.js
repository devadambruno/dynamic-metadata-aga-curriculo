export const config = {
  domainSource: "https://www.argologerenciadoraacervos.com.br/", // Your WeWeb app preview link
  patterns: [
      {
          pattern: "/perfilpublico/[^/]+",
          metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramuser}/metadata"
      }
      // Add more patterns and their metadata endpoints as needed
  ]
};
