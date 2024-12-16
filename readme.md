# AI-powered sponsor content review system

[The application is deployed to a website] https://yingyan797.github.io/sponsor-check

## Introduction

The main function of the application is to check whether the text/image/video content submitted by media creators match match the requirements of sponsors. Huggingface Transformer.js models including question answering, sentiment analysis, and summarization are utilized. 

Another function is designed for easier visualize of creator-sponsor communication history. There's a parser for processing raw csv files and extract contents of interests. Important information will be highlighted, and URLs texts will be rendered to clickable links. Table searching is supported.

## Setup and basic usage
The web application is written in HTML/Javascript/CSS.

## Challenges and future improvements
One challenge of writing the application is the integration of Transformer.js models in the overall workflow. Problems like async functions