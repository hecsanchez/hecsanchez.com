import { language } from "gray-matter";

export const configureLanguage = ctx => {
    const { req } = ctx;
    const langugae = req ? req.headers['accept-language'] : window.navigator.language;
    return language;
}