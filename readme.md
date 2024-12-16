# AI-powered sponsor content review system

[The application is deployed to a website] https://yingyan797.github.io/sponsor-check

## Introduction

The main function of the application is to check whether the text/image/video content submitted by media creators match match the requirements of sponsors. Huggingface Transformer.js models including question answering, sentiment analysis, and summarization are utilized. 

Another function is designed for easier visualize of creator-sponsor communication history. There's a parser for processing raw csv files and extract contents of interests. Important information will be highlighted, and URLs texts will be rendered to clickable links. Table searching is supported.

## Setup and basic usage
The web application is written in HTML/Javascript/CSS. No additional configuration or installation required, as Tranformer is importing online. Dowload the code and use the app by opening "index.html" in a live server. Alternatively, use the online web site.

The main page has two modules each corresponding to one function above. 
For rendering campaign history data, upload text-base file like csv and the table will be rendered. Additional options:
1. Show all URLs in raw text or clickable link
2. Enter a sender name, and only messages sent by the particular user will be displayed

For sponsor content check, enter sponsor brand name, description, upload content (text/image/video), and provide a brief/criteria document to check with. When everything is uploaded, 
1. Content preview will be displayed in textbox, image, or video player. If content is text-based, an auto summary will be generated.
2. Based on submitter description, related section from the provided brief document will be detected and shown in the right hand box (using a question answering model for selection)
3. General feedback will be created based on sentiment, brand safety, and key selling points (each using a question answering model).
4. Brief-specific feedback will be created by checking whether requirements are met. (using text2text generation model)

All media types are supported for submission. Text-based files are able to be checked with feedback. Images can create a brief description and segmentation analysis.
The whole inference procedure takes about 10 seconds, while some contents can be seen when they're ready.


## Challenges, developmebt process, and future improvements
One challenge of writing the application is the integration of Transformer.js models in the overall workflow. Problems like synchronization always gave me a hard time (though eventually resolved). Sometimes the model is not able to receive any input because file loading happening afterwards, creating seemingly reasonable AI response but based on wrong input. Also, response produced by AI is not received by the web page (giving Promise<Any>) due to missing "await" or "then".

Some issues remain, due to the limited capability of Tranformer models. It might not provide satisfying or coherent responses.

