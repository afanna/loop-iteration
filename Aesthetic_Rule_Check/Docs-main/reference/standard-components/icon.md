# Icon 组件

Icon 用于展示系统符号图标。当前实现基于运行时内置映射表，将组件的 name 转换为系统资源池中的符号资源后再渲染。

**起始版本：**  API Version 20


## 特有属性

除支持[通用属性](overview.md)，还支持以下特有属性：

| 属性 | 说明 |
|------|------|
| [name](#name) | 显示Icon资源名称 |

### name

显示Icon资源名称

**起始版本：**  API Version 20

| 属性 | 类型 | 必填 |  说明 |
|------|------| ------| ------|
| name | string | 是 | 显示Icon资源名称。<br/> 取值范围 <br/>："accountCircle"、"add"、"arrowBack"、"arrowForward"、"attachFile"、"calendarToday"、"call"、"camera"、"check"、"close"、"delete"、"download"、"edit"、"event"、"error"、"fastForward"、"favorite"、"favoriteOff"、"folder"、"help"、"home"、"info"、"locationOn"、"lock"、"lockOpen"、"mail"、"menu"、"moreVert"、"moreHoriz"、"notificationsOff"、"notifications"、"pause"、"payment"、"person"、"phone"、"photo"、"play"、"print"、"refresh"、"rewind"、"search"、"send"、"settings"、"share"、"shoppingCart"、"skipNext"、"skipPrevious"、"star"、"starHalf"、"starOff"、"stop"、"upload"、"visibility"、"visibilityOff"、"volumeDown"、"volumeMute"、"volumeOff"、"volumeUp"、"warning"。<br/>默认值："help"。非法名称在运行时会回退到 "help"。 |

**示例DSL：**

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "icon_surface",
    "components": [
      {
        "component": "Icon",
        "id": "baseIcon",
        "name": "home"
      }
    ]
  }
}
```

---

## name资源映射池

| name | 本地图标 |
|------|------|
| accountCircle | ![person_crop_circle_fill_1](../../assets/icon/person_crop_circle_fill_1.svg) |
| add | ![plus](../../assets/icon/plus.svg) |
| arrowBack | ![arrow_left](../../assets/icon/arrow_left.svg) |
| arrowForward | ![arrow_right](../../assets/icon/arrow_right.svg) |
| attachFile | ![paperclip](../../assets/icon/paperclip.svg) |
| calendarToday | ![calendar](../../assets/icon/calendar.svg) |
| call | ![phone_fill](../../assets/icon/phone_fill.svg) |
| camera | ![camera](../../assets/icon/camera.svg) |
| check | ![checkmark](../../assets/icon/checkmark.svg) |
| close | ![xmark](../../assets/icon/xmark.svg) |
| delete | ![trash](../../assets/icon/trash.svg) |
| download | ![arrow_down_circle](../../assets/icon/arrow_down_circle.svg) |
| edit | ![square_and_pencil](../../assets/icon/square_and_pencil.svg) |
| event | ![calendar_badge_clock](../../assets/icon/calendar_badge_clock.svg) |
| error | ![exclamationmark_circle](../../assets/icon/exclamationmark_circle.svg) |
| fastForward | ![fast_forward](../../assets/icon/fast_forward.svg) |
| favorite | ![heart_fill](../../assets/icon/heart_fill.svg) |
| favoriteOff | ![heart](../../assets/icon/heart.svg) |
| folder | ![folder](../../assets/icon/folder.svg) |
| help | ![questionmark_circle](../../assets/icon/questionmark_circle.svg) |
| home | ![house](../../assets/icon/house.svg) |
| info | ![info_circle](../../assets/icon/info_circle.svg) |
| locationOn | ![map_badge_local](../../assets/icon/map_badge_local.svg) |
| lock | ![lock](../../assets/icon/lock.svg) |
| lockOpen | ![lock_open](../../assets/icon/lock_open.svg) |
| mail | ![envelope](../../assets/icon/envelope.svg) |
| menu | ![dot_grid_2x2](../../assets/icon/dot_grid_2x2.svg) |
| moreVert | ![dot_grid_1x2](../../assets/icon/dot_grid_1x2.svg) |
| moreHoriz | ![more](../../assets/icon/more.svg) |
| notificationsOff | ![bell_slash](../../assets/icon/bell_slash.svg) |
| notifications | ![bell_fill](../../assets/icon/bell_fill.svg) |
| pause | ![pause](../../assets/icon/pause.svg) |
| person | ![person](../../assets/icon/person.svg) |
| photo | ![picture](../../assets/icon/picture.svg) |
| play | ![play_fill](../../assets/icon/play_fill.svg) |
| refresh | ![arrow_counterclockwise](../../assets/icon/arrow_counterclockwise.svg) |
| rewind | ![gobackward_15](../../assets/icon/gobackward_15.svg) |
| search | ![magnifyingglass](../../assets/icon/magnifyingglass.svg) |
| send | ![paperplane_right_fill](../../assets/icon/paperplane_right_fill.svg) |
| settings | ![gearshape](../../assets/icon/gearshape.svg) |
| share | ![share](../../assets/icon/share.svg) |
| skipNext | ![forward_end_fill](../../assets/icon/forward_end_fill.svg) |
| skipPrevious | ![backward_end_fill](../../assets/icon/backward_end_fill.svg) |
| star | ![star_fill](../../assets/icon/star_fill.svg) |
| starOff | ![star](../../assets/icon/star.svg) |
| upload | ![arrowshape_up_to_line_fill](../../assets/icon/arrowshape_up_to_line_fill.svg) |
| visibility | ![eye](../../assets/icon/eye.svg) |
| visibilityOff | ![eye_slash](../../assets/icon/eye_slash.svg) |
| volumeDown | ![speaker](../../assets/icon/speaker.svg) |
| volumeMute | ![speaker_slash](../../assets/icon/speaker_slash.svg) |
| volumeOff | ![speaker_wave_3_slash](../../assets/icon/speaker_wave_3_slash.svg) |
| volumeUp | ![speaker_wave_3](../../assets/icon/speaker_wave_3.svg) |
| warning | ![exclamationmark_triangle_fill](../../assets/icon/exclamationmark_triangle_fill.svg) |
| payment | ![payment](../../assets/icon/payment.svg) |
| phone | ![phone](../../assets/icon/phone.svg) |
| print | ![printer](../../assets/icon/printer.svg) |
| shoppingCart | ![cart](../../assets/icon/cart.svg) |
| starHalf | ![startHalf](../../assets/icon/startHalf.svg) |
| stop | ![stop_circle_fill](../../assets/icon/stop_circle_fill.svg) |


## DFX 说明

当宿主通过 [registerErrorCallback](../API/surface-controller.md#registererrorcallback) 注册错误回调时，Icon 的图标资源配置异常会通过 [onError](../API/surface-controller.md#errorcallback) 上报。

| 场景 | code值 | warning code | error message | 运行时处理 |
|------|--------|--------------|---------------|------------|
| name 不在预定义枚举中 | 2001 | ERROR_CODE_INVALID_VALUE | Property name expects a predefined icon enum value, drop current component | 丢弃该 Icon 组件 |

## 组件Schema

```json
{
  "type": "object",
  "allOf": [
    {
      "$ref": "../common_types.json#/$defs/ComponentCommon"
    },
    {
      "$ref": "../common_types.json#/$defs/CatalogComponentCommon"
    },
    {
      "type": "object",
      "properties": {
        "component": {
          "const": "Icon"
        },
        "name": {
          "description": "The name of the icon to display.",
          "oneOf": [
            {
              "type": "string",
              "enum": [
                "accountCircle",
                "add",
                "arrowBack",
                "arrowForward",
                "attachFile",
                "calendarToday",
                "call",
                "camera",
                "check",
                "close",
                "delete",
                "download",
                "edit",
                "event",
                "error",
                "fastForward",
                "favorite",
                "favoriteOff",
                "folder",
                "help",
                "home",
                "info",
                "locationOn",
                "lock",
                "lockOpen",
                "mail",
                "menu",
                "moreVert",
                "moreHoriz",
                "notificationsOff",
                "notifications",
                "pause",
                "payment",
                "person",
                "phone",
                "photo",
                "play",
                "print",
                "refresh",
                "rewind",
                "search",
                "send",
                "settings",
                "share",
                "shoppingCart",
                "skipNext",
                "skipPrevious",
                "star",
                "starHalf",
                "starOff",
                "stop",
                "upload",
                "visibility",
                "visibilityOff",
                "volumeDown",
                "volumeMute",
                "volumeOff",
                "volumeUp",
                "warning"
              ]
            },
            {
              "type": "object",
              "properties": {
                "path": {
                  "type": "string"
                }
              },
              "required": [
                "path"
              ],
              "additionalProperties": false
            }
          ]
        }
      },
      "required": [
        "component",
        "name"
      ]
    }
  ],
  "unevaluatedProperties": false
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
