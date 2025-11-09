export const config = {
  domainSource: "https://www.argologerenciadoraacervos.com.br/", // Your WeWeb app preview link
  patterns: [
      {
          pattern: "/perfilpublico/[^/]+",
          metaDataEndpoint: "https://api.argologerenciadoraacervos.com.br/api:tmCisItK/usercurriculo/{paramuser}/metadata"
      },
      {
          pattern: "/team/profile/[^/]+",
          metaDataEndpoint: "https://xeo6-2sgh-ehgj.n7.xano.io/api:LjwxezTv/team/profile/{profile_id}/meta"
      }
      // Add more patterns and their metadata endpoints as needed
  ]
};
