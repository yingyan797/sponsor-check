import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.2"

async function step_selection(description, steps) {
    const select = await pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli");
    const preds = await select(description, steps);
    const top_label = preds["labels"][0]
    // const top_score = preds["scores"][0];
    let i = 1;
    while (!isNaN(top_label.substring(0, i))) {
        i += 1;
    }
    return parseInt(top_label.substring(0, i-1));
}

async function text_feedback(content, brief) {
    const checker = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    // const feedback = await checker(
    //     "Based on the given specifications document, provide some feedback for the submitted contents. specification document as follows: '"+brief+"'; submitted contents as follows: '"+content+"'",
    //     {'max_new_tokens': 100}
    // )
    const feedback = await checker(
        "Provide some reasons why Mongolia is colder than Japan",
        {'max_new_tokens': 100}
    )
    return feedback[0]["generated_text"];
}

async function content_review() {
    var file = document.getElementById("media").files[0];
    let mtype = document.getElementById("mtype").value;
    if (file) {
        var reader = new FileReader();
        ["text", "image", "video"].forEach((m, i) => {document.getElementById("s_"+m).style.display = "none"});
        document.getElementById("s_"+mtype).style.display = "block";
        if (mtype == "text") {
            reader.readAsText(file, "UTF-8");
        } else {
            reader.readAsDataURL(file);
        }
        reader.onload = function (evt) {
            switch (mtype) {
                case "text": {
                    document.getElementById("s_text").innerHTML = evt.target.result;
                    break;
                }
                case "image": {
                    document.getElementById("s_image").src = evt.target.result;
                    break;
                }
                case "video": {
                    document.getElementById("s_video_source").src = evt.target.result;
                    document.getElementById("s_video").load();
                    break;
                }
            }
        }
        reader.onerror = function (evt) {
            alert("error reading file");
        }
    }
    let brief = document.getElementById("brief").value;
    if (brief == "") {
        brief = await parse_brief();
    }
    const feedback = await text_feedback(document.getElementById("s_text").innerText, brief);
    document.getElementById("ai_feedback").innerHTML = feedback;
}

async function parse_brief() {
    var file = document.getElementById("brief_doc").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = async function (evt) {
            document.getElementById("brief").innerHTML = await process_brief(evt.target.result);
        }
        reader.onerror = function (evt) {
            document.getElementById("brief").innerHTML = "error reading reference brief";
        }
        return document.getElementById("brief").innerHTML;
    }
    async function process_brief(brief) {
        const steps = [];
        let i = 0;
        let step = "";
        let n_steps = 1;
        let body = 0;
        while (i < brief.length) {
            let sl = 5+String(n_steps).length;
            if (brief.substring(i, i+sl).toLowerCase() == "step "+n_steps) {
                n_steps += 1;
                step = brief.substring(i, i+sl);
                i += sl;
                continue;
            } 
            if (brief[i] == "\n") {
                if (step != "") {
                    steps.push(step.substring(5));
                    body = i+1;
                }
                step = "";
            } else if (step != "") {
                step += brief[i];
            }
            i += 1;
        }
        if (step != "") {
            steps.push(step);
        }

        n_steps = await step_selection(document.getElementById("desc").innerText, steps);
        i = body;
        step = n_steps;
        const sl = 5+String(n_steps).length;
        while (i < brief.length) {
            if (brief.substring(i, i+sl).toLowerCase() == "step "+step) {
                if (step != n_steps)
                    break;
                step += 1;
                body = i;
                i += sl;
            } else {
                i += 1;
            }
        }

        return brief.substring(body, i);
    }
    return "";
}

window.content_review = content_review;
