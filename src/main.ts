import { Application, Assets } from "pixi.js";
import { QuizRPG,generateButton } from "./QuizRPG";

type questions = {
  "question": string,
  "choice": Array<string>,
  "answer": number
}

type formType = {
  "title": string,
  "questions": Array<questions>
}

(async () => {

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#96aca8", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const play_button = await generateButton(600,400,"プレイ！");

  const fileUploadForm = document.createElement("input");
  fileUploadForm.type = "file";
  fileUploadForm.accept = ".json";

  fileUploadForm.addEventListener("change", async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    const game_data = await Assets.load({src:fileURL,format: "json",parser:"json"});



    app.stage.addChild(play_button);

    play_button.onPress.connect(() => {QuizRPG(app,game_data); app.stage.removeChild(play_button);});

    document.body.removeChild(fileUploadForm);
  })

  const formBlock = document.createElement("div");


  const titleLabel = document.createElement("h3");
  titleLabel.innerHTML = "問題のタイトルを入力してください.";



  const titleInput = document.createElement("input");
  titleInput.type = "input";
  titleInput.id = "titleInput";

  formBlock.appendChild(titleLabel);
  formBlock.appendChild(titleInput);

  const questionForm = document.createElement("div");
  questionForm.className = "questionForm";

  const questionInput = document.createElement("input");
  questionInput.type = "input";
  questionInput.placeholder = "問題を入力";

  const choiceInput = document.createElement("input");
  choiceInput.type = "input";
  choiceInput.placeholder = "選択肢を入力";

  const answerInput = document.createElement("input");
  answerInput.type = "number";
  answerInput.placeholder = "答えを入力(インデックスで 一番目なら0、二番目なら1)";

  questionForm.appendChild(questionInput);
  for (let i = 0; i < 3; i++) {
    questionForm.appendChild(choiceInput.cloneNode(true));
  }
  questionForm.appendChild(answerInput);

  const addFormButton = document.createElement("button");
  addFormButton.innerHTML = "項目を追加";

  addFormButton.addEventListener("click", () => {
    formBlock.appendChild(questionForm.cloneNode(true));
  })

  const page_path = window.location.pathname.substring(1);
  const hash = window.location.hash;
  console.log(page_path);

  if (btoa(atob(page_path)) == hash && hash !== "") {
    const game_data = JSON.parse(decodeURIComponent(escape(atob(page_path))));;
    console.log("questionsの本当の型:", typeof game_data);
    app.stage.addChild(play_button);
    console.log(game_data);
    play_button.onPress.connect(() => {QuizRPG(app,game_data); app.stage.removeChild(play_button);});

    //document.body.removeChild(fileUploadForm);
  }
  if (page_path === "") {
    document.body.appendChild(fileUploadForm);
  }
  if (page_path === "create") {
    //document.body.removeChild(fileUploadForm);
    document.body.appendChild(formBlock);
    document.body.appendChild(addFormButton);
    const sendButton = document.createElement("button");
    sendButton.addEventListener("click", () => {
      const result: formType = {
        "title": "",
        "questions": [

        ]
      }
      const title_form = document.getElementById("titleInput") as HTMLInputElement;
      const title = title_form.value;
      result["title"] = title ?? "";
      const forms = formBlock.querySelectorAll(".questionForm");
      console.log(forms)
      forms.forEach(form => {
        const output_question = {
          "question": "",
          "choice": [] as string[],
          "answer": 0,
        }

        const question_input = form.children[0] as HTMLInputElement;
        output_question["question"] = question_input.value;
        const choice_input1 = form.children[1] as HTMLInputElement;
        const choice_input2 = form.children[2] as HTMLInputElement;
        const choice_input3 = form.children[3] as HTMLInputElement;
        output_question["choice"].push(choice_input1.value);
        output_question["choice"].push(choice_input2.value);
        output_question["choice"].push(choice_input3.value);
        const answer_input = form.children[4] as HTMLInputElement;
        output_question["answer"] = Number(answer_input.value);
        result.questions.push(output_question);
      })

      const result_json = JSON.stringify(result, null, 2);
      const base64str = btoa(unescape(encodeURIComponent(result_json)));
      const result_url = location.origin + "#" + base64str;
      const url_object = document.createElement("a");
      url_object.href = result_url;
      url_object.innerHTML = "問題へ";
      document.body.appendChild(url_object)
      console.log(result_url);
      const blob = new Blob([result_json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data.json";

      document.body.appendChild(link);
      //link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
    sendButton.innerHTML = "json作成";
    document.body.appendChild(sendButton);
  }

})();
