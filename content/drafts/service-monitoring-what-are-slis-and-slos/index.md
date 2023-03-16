---
title: "Service Monitoring - Part 1: Defining SLIs and SLOs"
date: "2023-03-13T21:00:00.000Z"
description: "Learn what SLOs and SLIs are in simple terms and how to define them."
tags:
    - observability
    - monitoring
    - site reliability
---

You've probably read several articles that go over SLIs, SLOs, and even SLAs, and still have not quite understood what they are or why they're used. In this article, I'll attempt to explain them to you in simpler terms.

# What are SLIs and SLOs?

Here's the basic terminology:

* **SLI** stands for **service level indicator** 
* **SLO** stands for **service level objective**

Think of SLIs as the instruments on your car dashboard like the speedometer and fuel gauge. They _indicate_ how fast you're going and how much gas you still have in the tank, respectively. However, those indicators don't mean anything unless you have an _objective_.

Think of SLOs as the objectives you set for the goal you're trying to achieve. You use SLIs to _indicate_ whether you will meet an objective and if you meet all the objectives, you will meet the goal.

Now imagine you have a a goal of getting to work in 30 minutes or less per every trip to your workplace that is 30 miles away:

**Goal:** Get to work in 30 minutes or less.

| SLI           | SLO                        | Period   |
|:--------------|:---------------------------|:---------|
| Fuel Quantity | Fuel Quantity > 25%        | Per trip |
| Average Speed | Average speed >= 60 MPH    | Per trip |

The above table states that if we have more than a quarter tank of gas and we maintain an average speed of at least 60 MPH, we will make it work in 30 minutes or less.

SLOs are the thresholds that help us determine if we're going to achieve our goals. SLIs help us measure that success. It's like that bit from Family Guy about the Russian cartoon [_Shoe and Shoelace_](https://www.youtube.com/watch?v=v5t-zH0N3-M) - one is meaningless without the other.

# Why do we use SLIs and SLOs?

Think about this: how do you know that anything you've ever deployed into a production environment has been and still is successful? If you're having a hard time answering that question, that is why we have SLIs and SLOs.

SLOs, specifically, give us some threshold of success. Without those thresholds, you're releasing new features into the wild hoping to not hear back from a mob of angry users. "Hoping no one complains" is a terrible strategy to measure success. That's why it's important to define SLOs because they define success and failure of our services.

Once that criteria of success and failure is defined, then you can start holding yourself and others in your organization accountable and actually start improving services.

It isn't any good to say that you're not meeting an SLO - you also have to fix it. When and how you fix a service depends on how your organization derives its urgency and severity, respectively, but at least there's now insight on why certain services need to be improved when there wasn't before.

Lastly, one additional reason why organizations use SLOs is because it allows them to communicate with confidence what they can and cannot deliver on to current and potential customers. You may have seen some companies claim they have "99.9% guaranteed uptime". That number didn't fall from the sky and that would be a gutsy claim to make if they weren't measuring it.

# How do we define SLOs?

SLOs are defined by one or more SLIs. On the flip side, an SLI can have multiple SLOs. Defining SLOs, though, can be a bit tricky if you've never done it before. The first thing you need to start with is a _goal_. Without a goal, you won't have a clue about which SLOs comprise the goal and subsequently, which SLIs comprise the SLOs.

## Types of SLIs

There is no "fixed" list of SLIs that you must choose from. SLIs vary depending on the context of your goals. However, there are some pretty common ones that you will see a lot:

| SLI          | Description |
|:-------------|:------------|
| Availability | The percentage of time that a service is available and responsive. |
| Latency | The time it takes for a service to respond to a request. |
| Uptime | The percentage of time that a service is running. Different from Availability - a service can be running (up) but unavailable (not processing requests correctly).
| Error Rate | The percentage of requests that result in an error. |
| Success Rate | The percentage of requests that result in a success. (Inverse of Error Rate) |
| Throughput | The number of requests that a service can handle within a certain time period. |
| Data Loss Rate | The percentage of data that is lost due to failures or errors. | 
| Data Corruption Rate | The percentage of data that becomes corrupted or invalid due to failures or errors. | 

Remember, this list isn't fixed. These are just really common ones that you'll find often. If you recall our example about our SLO for getting to work on time, our SLIs were "Fuel Quantity" and "Average Speed". SLIs are _contextual_. You don't need to monitor every SLI. Only monitor what's important to the SLOs you're creating.

## Case Study: SLOs for a Car Parts App

Imagine we have an app called "Car Parts App" that allows users to browse our car parts catalog, purchase car parts online, and review their order history.

The Car Parts App has three functions:

| Endpoint      | Description          |
|:--------------|:---------------------|
| `GET /parts`  | Search parts catalog |
| `POST /parts` | Buy parts            |
| `GET /orders` | View past orders     |

As a company, we have the following goals for our app:

1. Users should be able to purchase car parts online whenever they want.
2. Users should be able to find car parts they want to buy quickly.
3. Users can review their order history.

---

The first priority is arguably the most important to us because it's our primary source of income. If users are unable to purchase parts, then our entire revenue model comes to a grinding halt and we lose customers. Therefore, it's mission critical that _buying parts is a reliable service_.

In order to buy parts, though, customers need to be able to find parts quickly. If they can't find parts quickly, they'll get frustrated and leave the site and our business won't make any money. Therefore, it's also important that _searching the car parts catalog is a fast and reliable service_.

Lastly, users should be able to browse their order history in case they want to reorder parts they've purchased in the past.

Considering these priorities, we can start defining some SLOs.

A reliable service is an _available_ one. So we'll want to monitor availability as an SLI for both the catalog and for ordering.

A fast service is one with low _latency_ (at least in this case). You could additionally monitor how quickly someone finds a result from the moment they initiate searching, but we're going to focus solely on search query response times for sake of simplcity.

So we can start planning out our SLOs like so:

| Category | SLI          | SLO                   | Period    |
|:---------|:-------------|:----------------------|:----------|
| Catalog  | Availability | >= ??%                | Per month |
| Catalog  | Latency      | responses in <= ?? ms | Per month |
| Ordering | Availability | >= ??%                | Per month |

You'll notice we didn't define a latency SLO/SLI for Ordering. This is because as a company, we've decided that low latency is not of dire concern when submitting an order. If we did, we would probably include it. That doesn't mean we're perfectly fine with having `POST /orders` requests that take 10 seconds to submit. This is a good example of where you could actually have an SLI _without_ an SLO. This would at least give you a visual on how it performs in case we find out it has egregiously high latency so that we could plan to fix it. But it's not mission critical as long as our availability SLO isn't failing. Our customers don't expect ordering to be as fast as searching.

One more thing you'll notice is that we didn't setup any thresholds. We'll need to replace the `??`s with actual values, but how do we decide what those values should be? Picking these values is a little subjective, but shouldn't be mindless.

### Defining Availability

For availability, we need to set the bar high enough to hold our app to a high standard but not so high that it's unrealistic. We can't guarantee 100% availability - it's just not possible. One bug, maintenance window, or unexpected hardware failure will mean we've failed for the month. We _should_ expect unexpected problems to happen. Our success depends on how quickly we resolve them.

Availability for this app has the following formula:

```
availability = # of successful requests / # of total requests
```

We're going to set a goal of having 99.9% availability per month. This sounds very close to 100%, so why the hell would we pick a number so close? Let me explain.

In a 31-day month, like January for example, 99.9% of 31 days = 744 hours. 0.1% translates to 0.552 hours, which is roughly 30 minutes. Can we afford 30 minutes of downtime per month? I think so. But, this is where discussion amongst your team comes in. Maybe you don't think so and that we should aim for 99.8%. There's no right or wrong, there's only what makes sense to you and your company.

But if you remember, we have _two_ definitions for availability: one for Catalog and another for Ordering. In this case, we should have the same availability for both. You may be wondering, why track them separately then? Well, we want to be able to know which service is behaving unreliable in case we ever need to, but they both share the same SLO. This is because the two services depend on each other. If users can't search, they won't purchase items they're looking for and we lose money. If they can search for parts but can't purchase them, we still lose money. So we need the same objective for both.

### Defining Latency

TBD

# Conclusion

What I showed you here today is a simplistic way of defining SLIs and SLOs. Overall, it's important to understand that your SLIs and SLOs can be pretty much whatever you want them to be, but the important part is that they give you some measure of success and failure from the business' perspective.

In _Part Two_ we'll talk about how to actually implement these SLOs using Prometheus and Grafana to monitor this sample app.








