---
title: "Podio"
headline: "Podio (Citrix)"
subtitle: "Simplifying Complexity through Content First"
year: "2014"
url: "podio.com"
tags:
  - "Product design"
  - "UI"
  - "UX"
  - "Lo-fi and Hi-fi prototype"
  - "User Interview"
category: "Productivity, SaaS"
introduction: "Podio is a flexible project management tool that empowers teams to build their own custom workflows. However, this high degree of customisation created significant friction for new users, who struggled to navigate the abstract hierarchy of organisations, workspaces, and Items. Data showed a concerning trend: despite the platform's power, users were creating fewer items due to a disconnected experience between data overviews and detailed content editing."
order: 1
thumbnail: "/images/projects/podio/thumbnail.png"

heroImages:
  - src: "/images/projects/podio/old-vs-new.png"
    caption: "Old vs new item page"
    size: "large"
  - src: "/images/projects/podio/paper-metaphor.png"
    caption: "Podio item as a piece of paper"
    size: "large"
  - src: "/images/projects/podio/relationship-diagram.png"
    caption: "Item relationship diagram"
    size: "small"
timelineImage: -1
timelineAspect: 1.6
---

## Role & Strategy

As a Product Designer, I led the **Content First** redesign of the Podio Item page to bridge the gap between high-level overviews and detailed work. I moved the platform away from complex, navigation-heavy interfaces toward a **Paper-Based Metaphor**," where editing feels as natural as writing on a physical page.

By conducting user interviews and developing high-fidelity prototypes with seamless transitions, I reduced the cognitive load for users—allowing them to focus on their content rather than the system’s underlying complexity.

![Podio structure|span:1|col:2](/images/projects/podio/structure.png)

## Background and challenges

Our user base is diverse, with different industries utilizing Podio in unique ways. For instance, advertising agencies rely heavily on the activity stream, while recruiting companies focus on tasks. To unlock Podio's full potential, users must understand and adapt to its underlying structure, which consists of Items, Apps, Workspaces, and Organizations.

In Podio, an "Item" is a versatile term that represents any type of user-generated content, such as meetings, contacts, projects, or sales leads. Users have the freedom to customize their Item names, but despite this flexibility, we noticed a concerning trend: new users were creating fewer and fewer Items within the platform.

> So how could we make people understand Podio's core values and create more items?

## Why users didn't create enough items?

- Viewing, creating, and editing content is deep down in the hierarchy of the Podio structure.
- People lose their context once they click to see the content details from the activity stream or App Layout. This could be explained in 2 ways. First, the experience of perceiving data from the overview and details level is disconnected due to the page load time. Second, once they were on the item page, they couldn't navigate back to where they were.
- 40% of the item page is dedicated to navigation. The content did not stand out, and it was hard for users to focus on the content.
- Podio's core values—structure and workflow—are abstract, so they were harder to surface in the UI than in tools built around tasks or calendars.

## The process

We started by researching two main concepts in how people use Podio: overview and content details. Overview happens in the activity stream, inbox notifications, and app layout. Content details—where people add content, move work from "Working on" to "Done," comment, or assign tasks—live on the item page. We saw very high traffic between overview and the item page. A Kanban board is a good overview surface: you see progress at a glance, but each card lacks depth. That handoff should cost almost no cognitive load for navigation; people should stay focused on their content. That insight became our term: **Content First**.

## Old solution

In the old solution, we focused heavily on the flow between app layout and the item page using an interaction pattern called the Slidy Panel. In app layout, clicking a list item slid item details in from the right so people saw more without a full navigation jump, and overview-to-detail felt uninterrupted by page loads. The trade-off was new complexity elsewhere in the product.

![Slidy Panel interaction](/images/projects/podio/slidy-panel.png)

- First, the pattern appears only on the App Layout and not anywhere else.
- Users can only read that extra information. They cannot edit or comment on the content since they must submit it.
- Reading content from a small area like Slidy Panel didn't provide the best reading experience: space is limited, the content is surrounded by too much irrelevant information, and the moving in and out of Slidy panel made people feel uncertain.

## The solution

### Paper-Based Metaphor

We decided to remove the Slidy Panel and align on a single flow pattern for moving between overview and detail—one that could work across Podio. After a workshop in the shipyard area on the outskirts of Copenhagen, we landed on Content First. That led us to the new item page, where the content itself is the hero. The paper metaphor matched how we wanted that content to feel.

> Each item is represented as a piece of paper.

The concept of paper helps us to explain how information is structured in Podio since it's tangible. It also reflects in visual representation - an item is a white piece area on top of subtle grey. The comment is an additional element attached to the right of it.

![Podio item as a piece of paper](/images/projects/podio/paper-metaphor.png)

### Good Old Breadcrumb

We tidied up navigation from real usage data. We removed app-level navigation where we saw little cross-app hopping, and promoted breadcrumbs as the primary wayfinding pattern: compact, explicit, and text-forward. We used fewer icons and relied on clear labels.

### No Edit Mode. It's paper. Just write as you write on paper.

Ultimately, we wanted reading and writing to feel like paper, with as few chrome-heavy controls as possible. People should edit in place without flipping between separate "read" and "write" modes, so we removed Edit Mode and let them work on the item page like a word processor—no heavy frame around the content.

### Animation is crucial to explain items and their relationships

We learnt that transitions between overview and detail had to feel seamless. We reused the "paper lifts above the desk" metaphor across app layout, the activity stream, and inbox. We worked closely with engineering so content could load quickly on top of an existing view without feeling like a hard navigation break—people should still feel anchored to where they started. The animation below shows creating an item on top of an app layout page.

![Item creation animation](/images/projects/podio/item-animation.gif)

Using paper metaphors also helps us visualise the relationship between items. I have developed a lot of diagrams by studying the arrangement of stacked paper as the reference point. Referencing an item to another item is one of the most advanced and complicated features in Podio.

![Diagram showing how to use three-dimensional space to explain relationships among items](/images/projects/podio/relationship-diagram.png)
