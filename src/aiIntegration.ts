import { ChatCompletionResponseMessage, Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from './constants';

// OpenAI configuration creation
const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});
// OpenAI instance creation
const openai = new OpenAIApi(configuration);


export const getAiResponse = async (incomingMessage: string): Promise<ChatCompletionResponseMessage> => {
    return openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a helpful assistant named Brainiac." },
            { "role": "user", "content": incomingMessage },
        ]
    })
    .then((response) => {
        if (!response.data) {
            throw new Error(response.statusText);
        } else {
            if (response.data.choices[0].message) {
                return response.data.choices[0].message
            } else {
                throw new Error("No response message received");
            }
        }
    });
};