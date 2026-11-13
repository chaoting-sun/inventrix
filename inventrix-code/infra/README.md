# Deploy runbook (us-east-1)

One CDK stack, `Inventrix`: CloudFront (HTTPS) → ALB → one Fargate task (nginx + API) → RDS for PostgreSQL. The database password and `JWT_SECRET` live in Secrets Manager.

## Prerequisites

- The API reads `DATABASE_URL` and creates and seeds its own tables on startup (there is no separate migration step).
- Docker is running: `cdk deploy` builds both ARM64 images locally.
- Node 22 and pnpm.
- Credentials for the target account: `aws sts get-caller-identity` shows the account you mean to deploy to.
- The account and region are bootstrapped (once): `pnpm cdk bootstrap aws://<account>/us-east-1`.

## Deploy

```bash
cd inventrix-code/infra
pnpm install
pnpm cdk diff
pnpm cdk deploy
```

It takes about 20–30 minutes, mostly RDS and CloudFront. The app URL is printed as the `Inventrix.Url` output.

## Smoke test

```bash
URL=<Inventrix.Url>
curl -s "$URL/api/products" | head -c 200   # JSON with point_price
```

In the browser at `$URL`:

1. Log in as `customer@inventrix.com` / `customer123`.
2. Click a poop when one appears: the points balance grows by 10.
3. Open a product, add it to the cart, open the cart and check out.
4. The success page shows the order. **My Orders** lists it with the points spent.

If the site returns 502/503, read the API logs:

```bash
aws logs describe-log-groups --log-group-name-prefix Inventrix --query 'logGroups[].logGroupName'
aws logs tail <api log group> --since 30m
```

## Rollback and teardown

- A failed deploy rolls back by itself: the ECS circuit breaker restores the last working task, and CloudFormation reverts the stack.
- To roll back a bad release, check out the last good commit and run `pnpm cdk deploy` again.
- `pnpm cdk destroy` deletes everything in the stack, including the database (no snapshot). The `CDKToolkit` bootstrap stack and its asset bucket and ECR repository stay; delete them by hand if the account is done.
