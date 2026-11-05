# Astro Starter Kit: Minimal

Project-specific IA para negocios implementation, publication gates, review commands,
integration contracts and missing inputs: [ai-journey.md](./ai-journey.md).
The AI journey defaults to a draft; `npm run dev` previews `/es/ia/`.
The authorized production release publishes it only with the complete verified server environment;
production Vercel builds reject missing configuration. See [production-release.md](./production-release.md).

Prepared Worker/D1 signup persistence, Resend delivery/Contacts, complete form inventory,
retention/deletion workflow and activation blockers: [workers/signups/README.md](./workers/signups/README.md).
The Worker/D1 service is deployed with capture disabled pending coordinated activation.
New website signups use Resend after release; historical Buttondown subscribers are not migrated.

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
