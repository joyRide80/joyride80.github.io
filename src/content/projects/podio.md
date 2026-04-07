---
title: "Podio"
headline: "Podio"
subtitle: "Item Redesign"
year: "2014"
url: "podio.com"
tags:
  - "Product design"
  - "UI"
  - "UX"
  - "Lo-fi and Hi-fi prototype"
  - "User Interview"
category: "Productivity"
order: 5
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
---

## The brief

As a project management tool, Podio empowers users to tailor their workflow to their specific needs. However, this flexibility also introduces complexity, making it challenging for some users to navigate the system. Our user base is diverse, with different industries utilizing Podio in unique ways. For instance, advertising agencies rely heavily on the activity stream, while recruiting companies focus on tasks. To unlock Podio's full potential, users must understand and adapt to its underlying structure, which consists of Items, Apps, Workspaces, and Organizations. In Podio, an "Item" is a versatile term that represents any type of user-generated content, such as meetings, contacts, projects, or sales leads. Users have the freedom to customize their Item names, but despite this flexibility, we noticed a concerning trend: new users were creating fewer and fewer Items within the platform.

![Podio structure](/images/projects/podio/structure.png)

So how could we make people understand Podio core values and create more items?

Why users didn't create enough items?

- Viewing, creating, and editing content is deep down in the hierarchy of the Podio structure.
- People lose their context once they click to see the content details from the activity stream or App Layout. This could be explained in 2 ways. First, the experience of perceiving data from the overview and details level is disconnected due to the page load time. Second, once they were on the item page, they couldn't navigate back to where they were.
- 40% of the item page is dedicated to navigation. The content did not stand out, and it was hard for users to focus on the content.
- Podio core value — Structure and workflow are abstract that it's not apparent to see on the interface compared with task management or calendar tool.

![Old vs new item page. The blue area indicates the area dedicated to navigation.](/images/projects/podio/old-vs-new.png)

## The process

We started briefly by researching 2 main concepts of how people use Podio: Overview and Content Details. Overview happens in Activity Stream, Inbox Notification, and App Layout. Content Details, where people can add more content, change the status from 'Working on' to 'Done,' comment on the project, or assign tasks, happens on the item page. We found out that there is a very high frequency from all the workflow that people move between Overview and Content/item page. A good example is a kanban board which is suitable for overview. People can visually see the work progress, but it lacks detail on each card. Moreover, this activity should be so effortless that they should not use their cognitive load for navigation. Instead, it's their content they should focus on. So we come up with a term here: Content First.

## Old solution

In the old solution, we heavily focused on the flow between the App layout and the item page by implementing the interaction feature called Slidy Panel. When users are in the App layout, they can click on the item list, and the item details will Slide in from the right of the screen. By doing this, users can see more information without leaving the page, so the experience of moving between overview and detail is not interrupted by page loading time. However, we realized that this solution solved one thing but added another complexity.

![Slidy Panel interaction](/images/projects/podio/slidy-panel.png)

- First, the pattern appears only on the App Layout and not anywhere else.
- Users can only read that extra information. They cannot edit or comment on the content since they must submit it.
- Reading content from a small area like Slidy Panel didn't provide the best reading experience: space is limited, the content is surrounded by too much irrelevant information, and the moving in and out of Slidy panel made people feel uncertain.

## The solution

### Paper-Based Metaphor

We decided to remove Slidy Panel and came up with a new flow pattern — navigating between overview and detail content. This pattern should be used all over Podio. After a couple of days of workshop in the shipyard area on the outskirt of Copenhagen, we came up with Content First. It leads us to design the new item page where users just focus on the content. And paper metaphor is close to what the content should be presented.

Each item is represented as a piece of paper.

The concept of paper helps us to explain how information is structured in Podio since it's tangible. It also reflects in visual representation - an item is a white piece area on top of subtle grey. The comment is an additional element attached to the right of it.

![Podio item as a piece of paper](/images/projects/podio/paper-metaphor.png)

### Good Old Breadcrumb

We tidied up the navigation by analyzing users' behavior. We removed app navigation since we found that not many people navigate between apps. We used Breadcrumb as the primary navigation since it took less space and was very descriptive. We use fewer icons and be more explicit using text.

No Edit Mode. It's paper. Just write as you write on paper.

Ultimately, we would like to deliver the whole experience of reading and writing on paper by using less few web interface controls as possible. For example, people should just write and change the content without changing from reading to writing mode. So we removed Edit Mode and let them write on the item page as if they write on a word processor — No boxy border around the content.

Animation is crucial to explain items and their relationship

We have learned that the transition between overview and content needs to be seamless. We again used the concept of paper popping up on top of any overview pages — App Layout, Activity stream, or Inbox. We presented the idea to the developers to convince them that loading content on top of existing one must be very fast, and it shouldn't make people feel that they have left the page. They should still feel that they are reading something on the overview page. The animation below shows how to create an item on top of an App Layout page.

![Item creation animation](/images/projects/podio/item-animation.gif)

Using paper metaphors also helps us visualize the relationship between items. I have developed a lot of diagrams by studying the arrangement of stacked paper as the reference point. Referencing an item to another item is one of the most advanced and complicated features in Podio.

![Diagram showing how to use 3 dimensions space to explain the relationship among items](/images/projects/podio/relationship-diagram.png)
