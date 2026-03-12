/**
 * 内置任务库：仅保留通用、不绑定特定世界与角色名的任务。
 * 需要与剧情或某人绑定的任务请用「任务发布」APP 自建（写入 MVU 任务并带奖励等）。
 */
export interface QuestDefinition {
  id: string;
  name: string; // Used as MVU key under `任务.<name>`
  condition: string;
  rewardMcPoints: number;
}

export const QUEST_DB: QuestDefinition[] = [
  {
    id: 'quest_naked_public_no_hypno',
    name: '清醒的裸露',
    condition: '在不催眠的情况下让角色在有他人的地方全裸。',
    rewardMcPoints: 50,
  },
  {
    id: 'quest_delicious_food',
    name: '美味食物',
    condition: '让一名女角色吃下/喝下包含你精液的食物/饮料且未察觉。',
    rewardMcPoints: 20,
  },
  {
    id: 'quest_woke_up',
    name: '突然清醒',
    condition: '在和一名女性进行催眠性爱即将高潮时解除催眠。',
    rewardMcPoints: 20,
  },
  {
    id: 'quest_master_task',
    name: '主人的任务',
    condition: '让一名女角色在未被催眠的情况下自己主动和除你之外的一名男性做爱。',
    rewardMcPoints: 30,
  },
  {
    id: 'quest_group_sex',
    name: '我来错了？',
    condition: '组织一场至少2男2女参加的淫趴且其中有一名女性未被催眠。',
    rewardMcPoints: 50,
  },
  {
    id: 'quest_slave_circle',
    name: '奴隶循环',
    condition: '让A认为B是她的奴隶，B认为C是她的奴隶，C认为A是她的奴隶。',
    rewardMcPoints: 50,
  },
  {
    id: 'quest_placebo_hypno',
    name: '安慰剂效应',
    condition: '让一名没被催眠的角色以为自己被催眠了。',
    rewardMcPoints: 30,
  },
  {
    id: 'quest_furniture_mindset',
    name: '家具化',
    condition: '让一名角色深信自己是一件家具。',
    rewardMcPoints: 20,
  },
  {
    id: 'quest_pure_love_ntr',
    name: '纯爱牛',
    condition: '让一名角色认为出轨是纯爱的表现。',
    rewardMcPoints: 30,
  },
  {
    id: 'quest_proxy_hypno',
    name: '代理催眠',
    condition: '让一名角色用APP催眠另一名角色。',
    rewardMcPoints: 40,
  },
  {
    id: 'quest_dream_scenario',
    name: '盗梦空间',
    condition: '营造一个场景让一名角色以为自己在做梦。',
    rewardMcPoints: 25,
  },
  {
    id: 'quest_conflict_hypno',
    name: '逻辑崩溃',
    condition: '同时进行两项相互冲突的催眠。',
    rewardMcPoints: 15,
  },
  {
    id: 'quest_self_hypno',
    name: '自我沦陷',
    condition: '让自己被催眠。',
    rewardMcPoints: 15,
  },
  {
    id: 'quest_public_climax',
    name: '公开展示',
    condition: '让一名角色在公共场合高潮。',
    rewardMcPoints: 20,
  },
  {
    id: 'quest_yuri_action',
    name: '百合花开',
    condition: '让两名女角色相互亲热。',
    rewardMcPoints: 15,
  },
  {
    id: 'quest_public_leak',
    name: '论外',
    condition: '让一名角色在公众场合失禁。',
    rewardMcPoints: 25,
  },
  {
    id: 'quest_dignity_break',
    name: '尊严破坏',
    condition: '让一名角色在没被催眠的情况下对你全裸土下座。',
    rewardMcPoints: 50,
  },
  {
    id: 'quest_orgasm_strong',
    name: '强绝顶',
    condition: '让角色的快感值到达200后高潮。',
    rewardMcPoints: 15,
  },
  {
    id: 'quest_orgasm_super',
    name: '增强绝顶',
    condition: '让角色的快感值到达300后高潮。',
    rewardMcPoints: 25,
  },
  {
    id: 'quest_orgasm_ultimate',
    name: '超强绝顶',
    condition: '让角色的快感值到达400后高潮。',
    rewardMcPoints: 35,
  },
  {
    id: 'quest_orgasm_strongest',
    name: '最强绝顶',
    condition: '让角色的快感值到达500后高潮。',
    rewardMcPoints: 45,
  },
];
