import { blogContentType } from "@/utils/dotCMSClient";

export const navigationQuery = `
DotNavigation(uri: "/", depth: 2) {
    href
    target
    title
    children {
        href
        target
        title
    }
}
`;

export const blogListGraphQL = {
  content: { navigation: navigationQuery },
};

export const blogDetailGraphQL = {
  page: `
        urlContentMap {
            ... on ${blogContentType} {
                title
                description
                modDate
                urlTitle
                body {
                    json
                }
                image {
                    idPath
                    title
                }
            }
        }
    `,
  content: { navigation: navigationQuery },
};
