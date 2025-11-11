/*export const config = {
  //domainSource: "https://argologerenciadoraacervos.com.br", // Your WeWeb app preview link
 	domainSource: "https://www.argologerenciadoraacervos.com.br", //?origin=bypass",
  patterns: [
      {
          pattern: "/perfilpublico/[^/]+",
		  metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramCurriculo}/metadata"
		  //pattern: "^/perfilpublico/[^/]+/?$",
          //metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramuser}/metadata"
      }
      // Add more patterns and their metadata endpoints as needed
  ]
};*/

export const config = {
  // URL base do seu app publicado no WeWeb
  domainSource: "https://04f62633-9375-4d7d-81c9-0a0b7237981d.weweb-preview.io",

  patterns: [
    {
      // Regex que casa URLs do tipo /perfilpublico/qualquercoisa ou /perfilpublico/qualquercoisa/
      pattern: "^/perfilpublico/[^/]+/?$",

      // Placeholder do parâmetro DEVE bater exatamente com o nome usado no WeWeb
      metaDataEndpoint:
        "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/metadata/usuario?paramuserVAR={paramCurriculo}"
    }
  ]
};
