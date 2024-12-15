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

function content_review() {
    var file = document.getElementById("media").files[0];
    let mtype = document.getElementById("mtype").value;
    if (file) {
        var reader = new FileReader();
        let template = "";
        
        switch (mtype) {
            case "text": {
                reader.readAsText(file, "UTF-8");
                template = ["<textarea rows='15' cols='70' readonly>", "</textarea>"];
                break;
            }
            case "image": {
                reader.readAsDataURL(file);
                template = ["<img width='97%' src='", "'></img>"];
                break;
            }
            case "video": {
                break;
            }
        }
        reader.onload = function (evt) {
            document.getElementById("preview").innerHTML = template[0]+evt.target.result+template[1];
        }
        reader.onerror = function (evt) {
            document.getElementById("preview").innerHTML = "error reading file";
        }
    }
    parse_brief();
}

function parse_brief() {
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

    // document.getElementById("criteria").src = link;
}

window.content_review = content_review;
