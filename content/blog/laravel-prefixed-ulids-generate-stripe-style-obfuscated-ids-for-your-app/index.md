---
title: "Laravel Prefixed ULIDs: Generate Stripe-Style Obfuscated IDs for Your App"
date: "2025-04-23T12:38:00.000Z"
description: "Learn to craft prefixed ULIDs in Laravel for Stripe-style, obfuscated, user-friendly identifiers. This tutorial includes clear code examples, best practices, and performance tips to help you generate clean, secure IDs that look great and scale effortlessly."
tags:
    - laravel
    - php
---

In this article we'll cover how to craft beautiful user-friendly, Stripe-style IDs.

## Requirements

You will need a Laravel app (12.x or higher preferred, but not mandatory). I've only tested this with PostgreSQL, but this should work with any database.

## What are "Stripe-style" IDs?

[Stripe](https://stripe.com) crafts their IDs in a more human-readable format that makes it easier to identify what the ID is for. This is especially useful for apps where users are exposed to many types of IDs for various resources within an application and even more helpful when users depend on those IDs to successfully integrate with your app.

A few examples of what some of their IDs look like (these were slightly obfuscated):

- Products -> `prod_SBFrGC4rPdNhbc`
- Prices -> `price_1BGsLpR280W0fSucPw7GLkVK`
- Customers -> `cus_SGHldNBGew4vwK`

## Benefits of Prefixed ULIDs vs. Auto-Incrementing IDs

While the out-of-the-box auto-incrementing IDs from Laravel are convenient, they are not obfuscated, meaning the sequence of IDs is guessable. If your app is not secured well, a malicious actor could tamper with the parameters and potentially get access to information they're not supposed to.

With prefixed ULIDs:

- records are still sortable, just like auto-incrementing IDs are
- IDs are obfuscated, unlike auto-incrementing IDs, making it unclear to malcious actors what the next ID in the sequence is
- they make debugging easier. Seeing prefixed IDs in logs gives you immediate clarity on what the ID is for, reducing time wasted trying to figure out context
- they make it easier for users that depend on your IDs to avoid confusion if rely on copying/pasting IDs from your app

However, if you have internal tables with IDs that your users will never see or if you don't really need any of the benefits I mentioned, then I would stick with auto-incrementing IDs since generating prefixed IDs may just cause unnecessary overhead.

## What are ULIDs?

ULID stands for **Universally Unique Lexicographically Sortable Identifier** (should be "UULSID", but hey, I'm not at the board meetings). Unlike UUIDs, which you are probably more familiar with, these types of IDs are shorter and are generated using a timestamp and a bit of randomness to ultimately create a unique ID that is sortable.

An example of a ULID: `01JSGFZSXSRGF5196XNKSTTQQ4`

## Generating Prefixed ULIDs in Laravel

Here's a trait you can copy and paste into your codebase that you can attach to any model to generate prefixed ULIDs:

```php
<?php

// Adjust the namespace according to your app
namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasPrefixedUlid
{
    /**
     * Boot the trait.
     *
     * @return void
     */
    protected static function bootHasPrefixedUlid(): void
    {
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = static::generatePrefixedUlid();
            }
        });
    }

    /**
     * Generate a new ULID with the model's prefix.
     *
     * @return string
     */
    public static function generatePrefixedUlid(): string
    {
        return Str::lower(static::getUlidPrefix() . '_' . (string) Str::ulid());
    }

    /**
     * Get the prefix for the ULID.
     *
     * Override this method in your model to set a custom prefix. Defaults to the
     * lowercase plural form of the model name
     *
     * @return string
     */
    protected static function getUlidPrefix(): string
    {
        return Str::snake(class_basename(static::class));
    }

    /**
     * Initialize the trait.
     *
     * Disable auto-incrementing as we're using ULID and set the ID type to string.
     * This is automatically executed when the trait is registered on the model.
     *
     * @return void
     */
    public function initializeHasPrefixedUlid(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }
}
```

The trait will use the singular, lowercase, snake_cased name of your model to prefix the ID by default. The ULID is also lowercased. Some examples of what you could expect:

- User -> `user_<ULID>`
- Product -> `product_<ULID>`
- BillingCycle - `billing_cycle_<ULID>`

That last example `BillingCycle` is a bit rough. To override the automatically generated name, just override the `getUlidPrefix` method:

```php
<?php

// ...

class BillingCycle extends Model
{
    // ...

    /**
     * Override to provide your preferred prefix.
     */
    protected static function getUlidPrefix(): string
    {
        return 'bill';
    }
}
```

Now `BillingCycle` will generate IDs that look like `bill_<ULID>`.

---

Let's now apply the trait to the `User` model by adding `HasPrefixedUlid` (don't forget to import it).

In `app/Models/User.php`:

```php
<?php

namespace App\Models;

use App\Models\Concerns\HasPrefixedUlid;
use Illuminate\Foundation\Auth\User as Authenticatable;

// ...

class User extends Authenticatable
{
    use HasPrefixedUlid;

    // ...
}
```

Let's also update our `users` table to use string instead of integer for the `id` column.

In `0001_01_01_000000_create_users_table.php`, change the `id` column to `$table->string('id')->primary();`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id')->primary();
            // ...
        });

        // ...
    }

    // ...
};
```

Now create a user and check your `users` table and you should see an ID similar to the following:

```
user_01jsfqesj5x1dc7weppjr2nhvr
```

Congrats, you now have beautiful IDs.

You can repeat this for all the models you want to have prefixed ULIDs for.

## Trade-Offs

There are always trade-offs to any approach. In the case of using prefixed ULIDs:

- Sorting of prefixed ULIDs is limited to the table the ID belongs to (i.e. you can't sort globally). You will need to use other columns to sort globally.
- Longer IDs occupy more space in a database index. If your database needs are very particular about space, this may not be the best approach for you.

## Conclusion

Personally, I love this approach and it's worked for me for many apps I've written. I continue to use it to this day. If you would like me to expand further on the topic, leave me a comment and I'll be happy to update the article to include anything I may have missed.

