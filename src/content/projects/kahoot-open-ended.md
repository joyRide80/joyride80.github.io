---
title: "Kahoot!"
headline: "Kahoot! Open-Ended Questions"
subtitle: "Designing Cliff-Hangers in Game"
year: "2020"
url: "kahoot.com"
tags:
  - "Product design"
  - "Lo-fi & Hi-fi prototype"
  - "User interview"
  - "UI design"
category: "Edtech"
introduction: "Being played by 1 billion people annually, Kahoot! is known for multiple choice or close-ended questions. Players can only pick pre-defined answers from their smartphones when playing these games. It's that simple, quick, fun, and engaging. The challenge came when our primary target users, the teachers, requested a new game type, Open-ended question. This question type allows them to test deeper knowledge of a topic and see how well their students recall content without any cues."
order: 2
thumbnail: "/images/projects/kahoot/thumbnail.png"
heroImages:
  - src: "/images/projects/kahoot/kahootLogo.png"
    caption: "Mobile controller comparison"
    size: "large"
  - src: "/images/projects/kahoot/host-screen-1.png"
    caption: "Host screen — answer demographics"
    size: "large"
  - src: "/images/projects/kahoot/host-screen-2.png"
    caption: "Host screen — player answers"
    size: "small"
timelineImage: 0
---

![Kahoot! open-ended question overview](/images/projects/kahoot/thumbnail.png)

## Exploration

Before we decided to add this question type, we were concerned that the game experience would be inconsistent. For example, the pace of answering open-ended questions would be slower than close-ended ones. As a result, players need more time to formulate the answer and be careful about their typos.

How might we make a consistent user experience throughout the game?

## Designing text input UI

The open-ended question is the first game type in Kahoot! that players need to type to answer the question. In the beginning, I focused on the new design of the keyboard. I thought that launching a mobile phone keyboard during Kahoot! game hijacks Kahoot! game experience. To make the game experience consistent, we should show Kahoot! four color blocks on this new text input UI. I also look at Drops' UI as an inspiration. Drops doesn't use a mobile phone keyboard for text input. Instead, it has a custom-made one. Drops' keyboard provides only the letters that users can guess. For example, if the answer is 'Amazon,' the keyboard shows a group of letters with A, M, A, Z, O, and N in the groups. I made a keyboard prototype and showed it to people in the office. My first impression was that people looked puzzled and not so confident about what to do. Why can they only see a limited amount of letters? Why do they need to connect the letters by dragging? Why can't they tap on each letter like a 'normal' keyboard? From a technical point of view, if we allow a custom-made keyboard with a limited number of letters depending on the questions, it's so complex to build. It is because before the system launches each question, it needs to communicate to all mobile phones participating in the game. And currently, we allow up to 2000 participants. So I gave up on the idea of the custom-made keyboard. Instead, we decided to use a standard keyboard. However, instead of showing a plain white input field, we use Kahoot! color block as the input field background color. I am delighted with this compromised solution. By doing this, players are confident to type, and they still see the look and feel of Kahoot!

![Drops' custom-made keyboard used for learning vocabulary](/images/projects/kahoot/drops-keyboard.png)

![Kahoot! mobile controller for multiple-choice question vs. the new text input field for open-ended question](/images/projects/kahoot/text-input.png)

## A host's screen

After players submitted their answers, they all stared at the white screen, waiting for the correct answers. We discovered that we could make this waiting screen more fun and exciting. Instead of showing only the correct answer, we showed all the submitted ones. It's entertaining to see what others answer. When players see their answers on the screens, it triggers their hopes and makes them eager to wait for the revealing time. So we decided to make this moment more dramatic by prolonging the moment of suspicion.

I made many animation prototypes using Adobe After Effects and shared them with designers and developers. I collected a lot of feedback and fine-tuned the animation several times. We finally came up with this Cliffhanger moment. After players submit their answers, all answers appear on the screen simultaneously and start shaking. Some wrong answers are falling out of the screens; only the top 3 answers are still on the screen. Those top 3 answers grow big, and they are against each other. However, in the end, all answers but the right one fall from the screen. We not only use is Cliffhanger effect on this question type. We also continue to use it again in the latest question types called Slider.

<img src="/images/projects/kahoot/host-screen-1.png" alt="Host screen cycling between demographics and player answers" data-cycle="/images/projects/kahoot/host-screen-1.png,/images/projects/kahoot/host-screen-2.png" />

![Slider question type](/images/projects/kahoot/slider.png)
