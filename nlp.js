// import { pipeline } from '@huggingface/transformers';
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.2"
alert(1)
try {
    const classifier = await pipeline('sentiment-analysis');
    const output = await classifier('I love transformers!');

    console.log(output);
} catch (error) {
    console.log(error)
}
