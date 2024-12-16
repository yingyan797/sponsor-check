import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.2"

async function step_selection(description, steps) {
    const selector = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
    const pred = await selector(
        "Which of the following steps best match the description ```"+description+"```?",
        String(steps)
    )
    
    const answer = pred["answer"];
    let i = 0;
    let num = "";
    while (i < answer.length) {
        if (!isNaN(parseInt(answer[i]))) {
            num += answer[i];
        } else if (num != "") {
            break;
        }
        i++;
    }
    if (num == "") {
        num = 0;
    } else {
        num = parseInt(num);
    }
    console.log("step selection "+num)
    return num;
}

async function general_feedback(content) {
    const brand = document.getElementById("brand").value;
    console.log("general")
    const reader = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    // const brand = document.getElementById("brand").value;
    const out = await reader(content, {max_token: 200});
    console.log(out)
    document.getElementById("fb_sum").innerText = out[0].summary_text;

    const checker1 = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');
    const pred1 = await checker1(content);
    let color = "";
    let stm = "";
    switch (pred1[0].label[0]) {
        case '1': {
            color = "salmon";
            stm = ["Very negative", "Seems you feel unplesant about '"+brand+"' product/features. Reconsider whether creating the content or not."]
            break;
        }
        case '2': {
            color = "lightsalmon";
            stm = ["Negative", "Make sure not to mention too much disadvantage of '"+brand+"' product/features"]
            break;
        }
        case '3': {
            color = "azure";
            stm = ["Neutral", "Adjust your attitude toward '"+brand+"' more positive if you're satisfied with their product/features"]
            break;
        }
        case '4': {
            color = "greenyellow";
            stm = ["Potitive",  "Good, '"+brand+"' would like positive voice about their product/features."]
            break;
        }
        case '5': {
            color = "lightgreen";
            stm = ["Very positive", "Wonderful, '"+brand+"' would appreciate your satisfaction about their product/features. "] 
            break;
        }
    }
    document.getElementById("fb_gen").style.backgroundColor = color;
    document.getElementById("fb_gen").innerHTML = "[Sentiment] The overall tone of the submitted content is "+stm[0]+" ("+pred1[0].label+"/5) "+stm[1]+"\n";
    const checker2 = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');

    const pred3 = await checker2(
        "Is there any harmful information in the given content that might be negative to "+brand+" reputation or safety?",
        "Given content: "+content
    )
    document.getElementById("fb_gen").innerHTML += "[Brand safety issues] "+pred3.answer;

    const pred2 = await checker2(
        "What are some key selling points of "+brand+" product or features mentioned in the given content?",
        "Given content: "+content
    )
    document.getElementById("fb_gen").innerHTML += "[Selling points] "+pred2.answer;

}

async function brief_feedback(content, brief) {
    const checker = await pipeline('text-generation', 'onnx-community/Qwen2.5-Coder-0.5B-Instruct', {'dtype': 'q4'});
    const messages = [
        { "role": "system", "content": "You are a helpful assistant performing content benchmarking tasks. Given a piece of text content, check whether it follows the requirement written in the provided specification." },
        { "role": "user", "content": "Text content: ```"+content+"```. Specification document: ```"+brief+"```" },
    ];
    // const streamer = new TextStreamer(checker.tokenizer, {
    //     skip_prompt: true,
    // })

    const feedback = await checker(messages, { max_new_tokens: 200});
    return feedback[0].generated_text
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
                    general_feedback(evt.target.result);
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
            analyze_brief()
        }
        reader.onerror = function (evt) {
            alert("error reading file");
        }
    }
}

async function analyze_brief() {
    if (document.getElementById("brief").innerText != "") {
        return
    }
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

        let j = body;
        const segs = [];
        let seg = "";
        let start = false;
        while (j < i) {
            if (brief.substring(j, j+7) == "<aside>") {
                j += 7;
                start = true;
                continue
            } else if (brief.substring(j, j+8) == "</aside>") {
                if (seg) {
                    segs.push(seg);
                }
                j += 8;
                seg = "";
                start = false;
                continue;
            }
            if (start) {
                seg += brief[j];
            }
            j += 1;
        }
        if (seg != "") {
            segs.push(seg);
        }
        return segs;
    }
}

window.content_review = content_review;
