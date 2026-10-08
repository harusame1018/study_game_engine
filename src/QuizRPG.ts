
import { Assets, Sprite,Container,Text, Application  } from "pixi.js";
import { FancyButton } from "@pixi/ui";

await Assets.load("/assets/button/button_normal.png");
await Assets.load(`/assets/button/button_hover.png`);
await Assets.load("/assets/button/button_pressed.png");

type game_data_type = {
    "title":string,
    "questions": Array<question>
}

type question = {
    "question": string,
    "choice": Array<string>,
    "answer": number
}

export const generateButton = async (x:number,y:number,view_text:string) => {
  const btn = new FancyButton({
    defaultView: "/assets/button/button_normal.png",
    hoverView: `/assets/button/button_hover.png`,
    pressedView: `/assets/button/button_pressed.png`,
    text: view_text
  });
  btn.x = x;
  btn.y = y;
  return btn;
}

export async function QuizRPG(app:Application,game_data:game_data_type) {
    const miss_question:question[] = [];

    let question_count = 0;
    let correct_count = 0;
    let miss_question_count = 0;

    const attackPower = 10;

    let playerHp = 100;

    let slime_HP = 100;

    let button_flag = false;

    const sleep = (ms: number): Promise<void> => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };
    const add_slime = async () => {
        const texture = await Assets.load("/assets/slime1.png");
        const slime = new Sprite(texture);
        app.stage.addChild(slime);
        slime.x = 1400;
        console.log(app.screen.width,app.screen.height);
        slime.y = app.screen.height / 2 - 256;
    };

    add_slime();

    /*
    const get_game_data? = async () => {
        const content = await fetch('/data/data.json');
        const data = await content.json();
        return(data);
    };

    const game_data? = await get_game_data?();
    console.log(game_data?)
    */
    // ========Label作成とか========

    const judge_label_container = new Container();

    app.stage.addChild(judge_label_container);

    const label_container = new Container();

    app.stage.addChild(label_container);

    const slimeHpLabel = new Text({ text:"スライムのHP:" + slime_HP });

    slimeHpLabel.x = 1400
    slimeHpLabel.y = 400;

    label_container.addChild(slimeHpLabel);

    const updateSlimeHP = async (damage:number) => {
        slime_HP -= damage;
        slimeHpLabel.text = "スライムのHP:" + slime_HP;
    }

    const playerHpLabel = new Text({ text:"プレイヤーHP:" + playerHp});

    playerHpLabel.x = 900;
    playerHpLabel.y = 800;

    label_container.addChild(playerHpLabel);

    const updatePlayerHp = async (damage:number) => {
        playerHp -= damage;
        playerHpLabel.text = "プレイヤーHP:" + playerHp;
    }
  console.log(game_data);
  console.log(question_count);
    const question_label = new Text({
        text:game_data?.questions?.[question_count]?.["question"] || "問題がありません"
    })

    question_label.x = 330;
    question_label.y = 300;

    judge_label_container.addChild(question_label);

    const title_label = new Text({
        text:game_data?.title,
    })

    title_label.x = 830;
    title_label.y = 200;

    judge_label_container.addChild(title_label)

    const correct_label = new Text({
        text:"正解！！",
    })

    correct_label.x = 830;
    correct_label.y = 400;

    judge_label_container.addChild(correct_label)
    correct_label.visible = false

    const failed_label = new Text({text:"不正解..."});

    failed_label.x = 830;
    failed_label.y = 400;

    judge_label_container.addChild(failed_label);
    failed_label.visible = false

    const answer_label = new Text({text:"答え:" + game_data?.questions[question_count]["choice"][game_data?.questions[question_count]["answer"]]})

    answer_label.x = 830;
    answer_label.y = 450;

    judge_label_container.addChild(answer_label);
    answer_label.visible = false

    // =========正解かどうか判定========

    const judge_correct = async (index:number,is_miss:boolean) => {
    if (!button_flag) {
        button_flag = true;
        if (is_miss) {
            const choice = miss_question[miss_question_count]["choice"];
            const answer_index = miss_question[miss_question_count]["answer"];

            if (choice[index] === choice[answer_index]) {
                correct_label.visible = true;
                await sleep(2000);
                correct_label.visible = false;
                button_flag = false;
            } else {
                failed_label.visible = true;
                answer_label.visible = true;
                await sleep(2000);
                failed_label.visible = false;
                answer_label.visible = false;
                button_flag = false;
            }
            miss_question_count++;
            update_button(true);
        } else {
            const choice = game_data?.questions[question_count]["choice"]
            const answer_index = game_data?.questions[question_count]["answer"];

            if (choice[index] === choice[answer_index]) {
                correct_label.visible = true;
                correct_count++;
                await sleep(2000);
                correct_label.visible = false;
                button_flag = false;
                updateSlimeHP(attackPower);
            }
            else {
                failed_label.visible = true;
                answer_label.visible = true;
                await sleep(2000);
                failed_label.visible = false;
                answer_label.visible = false;
                button_flag = false;
                updatePlayerHp(10);
                miss_question.push(game_data?.questions[question_count]);
            }
            question_count++;
            update_button(false);

        }

    }

}


  //=========ボタン類=========

  const button_container = new Container();

  const answerButton1 = await generateButton(0,0,game_data?.questions[question_count]["choice"][0]);
  const answerButton2 = await generateButton(300,0,game_data?.questions[question_count]["choice"][1]);
  const answerButton3 = await generateButton(600,0,game_data?.questions[question_count]["choice"][2]);

  answerButton1.onPress.connect(() => judge_correct(0,false));
  answerButton2.onPress.connect(() => judge_correct(1,false));
  answerButton3.onPress.connect(() => judge_correct(2,false));

  if (answerButton1 && answerButton2 && answerButton3) {
    button_container.addChild(answerButton1);
    button_container.addChild(answerButton2);
    button_container.addChild(answerButton3);
  }

  app.stage.addChild(button_container)
  button_container.x = 500
  button_container.y = 600

  const update_button = async (is_miss:boolean) => {
    if (!is_miss) {
        if (question_count < game_data?.questions.length) {
            const choice = game_data?.questions[question_count]["choice"]
            answerButton1.text = choice[0];
            answerButton2.text = choice[1];
            answerButton3.text = choice[2];
            question_label.text = game_data?.questions[question_count]["question"];
            answer_label.text = choice[game_data?.questions[question_count]["answer"]];
        }
        else {
            result(false);
        }
    } else {
        if (miss_question_count < miss_question?.length) {
            const choice = miss_question[miss_question_count]["choice"];
            answerButton1.text = choice[0];
            answerButton2.text = choice[1];
            answerButton3.text = choice[2];
            question_label.text = miss_question[miss_question_count]["question"];
            answer_label.text = choice[miss_question[miss_question_count]["answer"]];
        } else {
            result(true);
        }
    }
  }

  //=========けっかはっぴょーのコード========

  const result = async (is_miss:boolean) => {
    button_container.visible = false;
    judge_label_container.visible = false;
    label_container.removeChildren();


    if (!is_miss) {
        const point_label = new Text({text:"正答数:" + correct_count + "/" + (question_count)});

        point_label.x = 900;
        point_label.y = 300;

        label_container.addChild(point_label);

        const result_label = new Text({text:"敵スライムのHP:" + slime_HP + "\nプレイヤーのHP:" + playerHp})

        result_label.x = 900;
        result_label.y = 400;

        label_container.addChild(result_label)

        if (miss_question.length !== 0) {
            console.log("ミスがあるよ！");
            answerButton1.onPress.disconnectAll();
            answerButton2.onPress.disconnectAll();
            answerButton3.onPress.disconnectAll();

            answerButton1.onPress.connect(() => judge_correct(0,true));
            answerButton2.onPress.connect(() => judge_correct(1,true));
            answerButton3.onPress.connect(() => judge_correct(2,true));
            const retry_button = await generateButton(300,-20,String(miss_question.length) + "回間違えたよ、もう一度挑戦する？");

            app.stage.addChild(retry_button);

            retry_button.onPress.connect(() => {
                judge_label_container.visible = true;
                button_container.visible = true;
                update_button(true);
                app.stage.removeChild(retry_button);
                label_container.removeChildren();
            })
        }
    } else {
        const fight_label = new Text({text:"あなたは深淵をも震わせた..."});

        fight_label.x = 900;
        fight_label.y = 300;

        label_container.addChild(fight_label);
    }
  }
}
