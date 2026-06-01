<p align="center">
  <img src="assets/readme/kuma-professional-banner.svg" alt="KUMA Social - student-focused social media for the RHUL community" width="100%" />
</p>

<h1 align="center">KUMA Social Media</h1>

<p align="center">
  <strong>A student-focused social platform for Royal Holloway, University of London.</strong>
</p>

<p align="center">
  <a href="https://kuma-social-media.netlify.app">
    <img alt="Live app" src="https://img.shields.io/badge/live%20app-kuma--social--media.netlify.app-FF4E01?style=for-the-badge&logo=netlify&logoColor=white">
  </a>
  <a href="https://github.com/dana-khaing/KUMA_SocialMedia/releases/tag/v0.1-beta">
    <img alt="Release" src="https://img.shields.io/badge/release-v0.1--beta-111827?style=for-the-badge&logo=github">
  </a>
  <img alt="Status" src="https://img.shields.io/badge/status-deployed%20beta-16A34A?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-2563EB?style=for-the-badge">
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-MySQL-2D3748?style=flat-square&logo=prisma">
  <img alt="Clerk" src="https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white">
  <img alt="Pusher" src="https://img.shields.io/badge/Realtime-Pusher-300D4F?style=flat-square&logo=pusher">
  <img alt="Cloudinary" src="https://img.shields.io/badge/Media-Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white">
  <img alt="Netlify" src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white">
</p>

## About

KUMA is a student-focused server-side rendering social media web application built for the Royal Holloway, University of London community.

It gives RHUL students a familiar place to create profiles, connect with classmates, share posts and stories, react to content, write comments, and keep up with activity across their network.

**Live beta:** [kuma-social-media.netlify.app](https://kuma-social-media.netlify.app)

**Release:** [v0.1-beta](https://github.com/dana-khaing/KUMA_SocialMedia/releases/tag/v0.1-beta)

**Tags:** `social-media` `student-community` `server-side-rendering` `nextjs` `react` `prisma` `mysql` `clerk` `pusher` `cloudinary` `tailwindcss` `notification-system` `final-year-project`

This repository contains the final year project source code, supporting documentation, tests, and presentation materials.

## Product Highlights

- **Student-first profiles:** avatar, cover image, bio, education, work, city, birthday, and website fields.
- **Social posting:** text posts, image uploads, comments, likes, loves, and single-post routing.
- **Stories:** short-lived story posts with grouped story display.
- **Network graph:** follow, unfollow, follow request, accept, reject, and block workflows.
- **Notification center:** activity feed, unread states, preferences, and realtime delivery with Pusher.
- **Production stack:** Clerk auth, Prisma/MySQL persistence, Cloudinary media storage, and Netlify deployment.

## Features

- Clerk-powered authentication with protected app routes
- User profiles with avatar, cover image, bio, education, work, city, birthday, and website fields
- Social feed showing posts from followed users
- Text and image posts with Cloudinary upload support
- Stories with expiry times and grouped story display
- Likes, loves, and comments on posts
- Likes on comments
- Follow, unfollow, follow request, accept, reject, and block flows
- Friend request, birthday, suggested friends, activity, and notification views
- Realtime notifications with Pusher-backed delivery and a MySQL source of truth
- Clerk webhook integration to create, update, and delete local user records
- Prisma data layer backed by MySQL
- Jest test coverage for key server actions, middleware, and webhook behavior

## Tech Stack

- **Framework:** Next.js 15
- **Rendering:** Server-side rendering with the Next.js App Router
- **UI:** React 19, Tailwind CSS, shadcn/ui-style components, Radix UI, Font Awesome, Lucide
- **Authentication:** Clerk
- **Database:** MySQL with Prisma ORM
- **Media uploads:** Cloudinary / next-cloudinary
- **Realtime:** Pusher Channels
- **Deployment:** Netlify
- **Validation:** Zod
- **Testing:** Jest and React Testing Library

## Deployment

The beta deployment is hosted on Netlify:

```text
https://kuma-social-media.netlify.app
```

Clerk webhooks should target:

```text
https://kuma-social-media.netlify.app/api/webhooks/clerk
```

## License

This project is licensed under the [MIT License](LICENSE).

## Repository Structure

```text
.
├── assets/
│   └── readme/
│       └── kuma-readme-banner.svg
├── README.md
├── diary.md
├── documents/
│   ├── Structure— Eraser.pdf
│   └── video_link.txt
└── product/
    └── frontend/
        ├── prisma/
        │   └── schema.prisma
        ├── public/
        ├── src/
        │   ├── app/
        │   ├── components/
        │   ├── lib/
        │   ├── middleware.js
        │   └── __tests__/
        ├── package.json
        └── pnpm-lock.yaml
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm
- MySQL database
- Clerk application
- Cloudinary account and unsigned upload preset

### Installation

Clone the repository and install the frontend dependencies:

```bash
git clone https://github.com/dana-khaing/KUMA_SocialMedia.git
cd KUMA_SocialMedia/product/frontend
pnpm install
```

### Environment Variables

Create a `.env.local` file inside `product/frontend`:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
SIGNING_SECRET="your_clerk_webhook_signing_secret"
NEXT_PUBLIC_CLERK_FALLBACK_URL="/sign-in"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"

PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
```

The current upload preset used in the app is:

```text
kumasocialmedia
```

Create the same unsigned upload preset in Cloudinary, or update the preset name in the upload widgets under `src/components/home/`.

### Database Setup

Generate the Prisma client:

```bash
pnpm prisma generate
```

Apply the Prisma schema to your MySQL database:

```bash
pnpm prisma db push
```

Optional: open Prisma Studio to inspect local data:

```bash
pnpm prisma studio
```

### Clerk Webhook

KUMA uses a Clerk webhook at:

```text
/api/webhooks/clerk
```

Configure this endpoint in the Clerk dashboard and subscribe to:

- `user.created`
- `user.updated`
- `user.deleted`

Copy the webhook signing secret into `SIGNING_SECRET`.

## Running the App

Start the development server from `product/frontend`:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Build and run the production version:

```bash
pnpm build
pnpm start
```

## Testing

Run the Jest test suite:

```bash
pnpm test
```

The tests currently cover middleware behavior, webhook handling, and core social actions such as posts, comments, reactions, stories, search, profile updates, follows, and blocks.

## Main App Routes

- `/` - Home feed
- `/profile/[id]` - User profile
- `/post/[postId]` - Single post page
- `/friendlist` - Friend and follow views
- `/activity` - Notifications and activity
- `/studio` - Studio page
- `/sign-in` - Clerk sign in
- `/sign-up` - Clerk sign up

## Project Notes

KUMA was created as a final year computer science project at Royal Holloway, University of London. The goal is to provide a focused student community platform where RHUL students can build connections, share knowledge, and discuss topics in a familiar social media experience.
