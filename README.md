# Dodo Payments — Tiny Embeddable Checkout

## Overview

A small embeddable checkout built with React, TypeScript,
Tailwind CSS and an iframe-based SDK.

## Features

- Embeddable checkout SDK
- Product checkout
- Fake payment processing
- Success state
- Declined payment state
- Retry flow
- Loading state
- Keyboard close
- Backdrop close
- Secure postMessage communication
- Callback event logging
- Responsive checkout

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Running Locally

npm install
npm run dev

## Production Build

npm run build
npm run preview

## Architecture

Demo Site
    |
    | DodoCheckout.open()
    ↓
SDK
    |
    | Creates iframe
    ↓
Checkout App
    |
    | Fake payment
    ↓
SDK
    |
    | postMessage
    ↓
Demo Site

## Payment Test Cards

4242 4242 4242 4242
Successful payment

4000 0000 0000 0002
Payment declined

4000 0000 0000 0341
Fails once, succeeds on retry

## Security

The checkout runs inside an iframe so card details remain
inside the checkout application and are not exposed to the
merchant page.

The SDK validates both the message origin and the iframe
source before processing checkout events.

## Design Decisions

### 1. Iframe instead of rendering directly

I chose an iframe so the checkout remains isolated from the
host page. This also keeps card fields inside the checkout
context.

### 2. Keep checkout open after payment failure

Instead of closing the checkout after an error, the customer
can correct/retry the payment without starting the checkout
again.

## What I Would Explore Next

- Real payment provider integration
- Stronger runtime message validation
- Better accessibility testing
- Automated integration tests
- Network timeout/recovery states
- Localization and currency support
- Production-grade SDK packaging