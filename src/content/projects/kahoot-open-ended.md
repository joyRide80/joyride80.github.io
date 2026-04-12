---
title: "Kahoot!"
headline: "Expanding the Kahoot! Experience"
subtitle: "Introducing Open-Ended Questions"
year: "2020"
url: "kahoot.com"
tags:
  - "Product design"
  - "Lo-fi & Hi-fi prototype"
  - "User interview"
  - "UI design"
category: "Edtech"
introduction: "Kahoot! is a global learning platform known for its fast-paced, multiple-choice games. To evolve the experience for its 1 billion annual players, we needed to move beyond pre-defined answers to support deeper knowledge assessment through a new Open-Ended question type."
order: 5
thumbnail: "/images/projects/kahoot/kahootLogo.png"
heroImages:
  - src: "/images/projects/kahoot/thumbnail.png"
    caption: ""
    size: "large"
  - src: "/images/projects/kahoot/slider.png"
    caption: ""
    size: "large"
timelineImage: -1
---

## My Approach

<div class="text-pair-row">
  <div class="text-pair-row__col">

As a Product Designer, I led the design of this feature to help teachers test student recall without visual cues. I focused on maintaining Kahoot!’s signature "quick and fun" energy

  </div>
  <div class="text-pair-row__col">

while building a UI that could handle diverse text inputs. Through prototyping and user testing, I bridged the gap between casual engagement and serious academic evaluation.

  </div>
</div>

<div class="project__content-row-break" aria-hidden="true"></div>

![|span:1|col:2](/images/projects/kahoot/kahootLogo.png)

## Exploration

<div class="text-wide">

Before we decided to add this question type, we were concerned that the game experience would be inconsistent. For example, the pace of answering open-ended questions would be slower than close-ended ones. As a result, players needed more time to formulate their answers and be careful about typos.

</div>

<div class="text-wide">

<p class="project__intro-text">How might we create a consistent user experience throughout the game?</p>

</div>

## Designing text input UI

<div class="text-pair-row">
  <div class="text-pair-row__col">
The open-ended question is the first game type in Kahoot! where players need to type to answer. In the beginning, I focused on the design of the keyboard. I thought that launching a mobile phone keyboard during a Kahoot! game might hijack the experience. To keep it consistent, we wanted to show Kahoot!'s four color blocks on this new text input UI.
  </div>

  <div class="text-pair-row__col">
I also looked at Drops' UI for inspiration. Drops doesn't use a mobile phone keyboard for text input; instead, it has a custom-made one that provides only the letters users can guess. For example, if the answer is 'Amazon,' the keyboard shows a group of letters containing A, M, A, Z, O, and N.
  </div>
</div>

![Drops' custom-made keyboard used for learning vocabulary |span:1|col:3](/images/projects/kahoot/drop_interface.png)

<div class="text-wide">
I made a keyboard prototype and showed it to people in the office. My first impression was that people looked puzzled and were not confident about what to do. Why could they only see a limited number of letters? Why did they need to connect the letters by dragging? Why couldn't they tap on each letter like a 'normal' keyboard? 
</div>
<div class="text-wide">
From a technical point of view, a custom-made keyboard with a limited number of letters was complex to build. This was because before the system launches each question, it needs to communicate with all mobile phones participating in the game—and we allow up to 2,000 participants. So, I moved away from the custom keyboard idea and we decided to use the standard system keyboard instead. 
</div>
<div class="text-wide">
However, instead of showing a plain white input field, we used Kahoot! color blocks as the background. I was delighted with this solution. By doing this, players felt confident typing while still seeing the signature look and feel of Kahoot!
</div>

![Multiple-choice question |span:2|col:1](/images/projects/kahoot/multiple.png)

![Open-ended question |span:2|col:3](/images/projects/kahoot/typeanswer.png)

## A host's screen

<div class="text-wide">
After players submitted their answers, they often stared at a white screen waiting for the results. We discovered we could make this moment more exciting. Instead of showing only the correct answer, we showed all the submitted ones. It was entertaining to see what others had typed. 
</div>
<div class="text-wide">
When players saw their own answers on the screen, it built anticipation. We decided to make this moment more dramatic by prolonging the "moment of suspicion."
</div>

<figure>
  <div class="project__embed" style="aspect-ratio: 1568 / 1024">
    <iframe
      src="https://player.vimeo.com/video/763200589?title=0&byline=0&portrait=0&badge=0&vimeo_logo=0&autopause=0&controls=0&autoplay=1&muted=1&loop=1&player_id=0&app_id=58479"
      width="1568"
      height="1024"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      title="open-ended question"
      loading="lazy"
      allowfullscreen
    ></iframe>
  </div>
  <figcaption>An animation prototype exploring a "Cliffhanger" moment on the host's screen</figcaption>
</figure>

<div class="text-wide">
I made many animation prototypes using Adobe After Effects and shared them with designers and developers. After several rounds of feedback and fine-tuning, we came up with this "Cliffhanger" moment. After players submit their answers, all entries appear on the screen simultaneously and start shaking. Some wrong answers fall away, leaving only the top three. These answers grow larger as they compete, until finally only the correct one remains.
</div>

![The design focuses on the demographics of correct answers.|span:2|col:1](/images/projects/kahoot/host-screen-demo.png)

![The design focuses on the players' answers.|span:2|col:3](/images/projects/kahoot/host-screen-players.png)
