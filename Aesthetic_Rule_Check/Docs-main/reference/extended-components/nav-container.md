# NavContainer 组件

用于在单个容器内按索引展示多个子页面。

## 特有属性

除支持 [通用属性](overview.md#通用属性) 和 [styles 通用样式](overview.md#styles-通用样式)，还支持以下字段：

| 字段名 | 字段类型 | 说明 |
|------|------|------|
| [children](#children) | 属性 | 子页面组件 id 列表 |
| [currentIndex](#currentindex) | 属性 | 当前展示页面索引 |
| [styles](#styles) | 样式 | 通用样式对象（当前无专用私有样式字段） |

## 属性字段

### children

子页面列表。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | [ComponentId](../types.md#componentid)[] | 是 | 仅支持[静态子组件列表](../types.md#静态子组件列表)形式的子组件 id 数组，不支持[动态模板](../types.md#动态模板)。数组中的每一项都应指向同一 components 列表中已定义的页面根组件；非字符串项会被忽略。 |

### currentIndex

当前展示页索引。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentIndex | [DynamicNumber](../types.md#dynamicnumber) | 是 | 支持字面量数字、[DataBinding](../types.md#databinding) 路径绑定和 [FunctionCall](../functions/functioncall.md)；运行时会向下取整并裁剪到有效范围。非法值回退为 0。 |

### styles

通用样式对象。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| styles | object | 否 | 支持 [styles 通用样式](overview.md#styles-通用样式)。当前 NavContainer 暂无专用私有样式字段。 |

## 异常值与边界处理

- children 为空或无可用子项时，组件不会显示任何子页面。
- currentIndex 解析失败、未传或类型不匹配时，回退为 0。
- currentIndex 小于 0 时按 0 处理，大于最大索引时按最后一个子项处理。
- 组件当前没有额外的 fallback 文案。

## 运行时行为

- currentIndex 会自动裁剪到 [0, children.length - 1]。
- currentIndex 支持字面量数字、数据绑定或返回数字的函数调用。

## 示例

```json
[
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "extended-nav-container-surface",
    "catalogId": "ohos.a2ui.extended.catalog"
  }
},

{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "extended-nav-container-surface",
    "value": {
      "navModel": {
        "activeIndex": 1
      }
    }
  }
},

{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "extended-nav-container-surface",
    "components": [
      {
        "id": "root",
        "component": "NavContainer",
        "children": ["pageOne", "pageTwo", "pageThree"],
        "currentIndex": { "path": "/navModel/activeIndex" },
        "weight": 1
      },
      {
        "id": "pageOne",
        "component": "Text",
        "content": "第一页内容"
      },
      {
        "id": "pageTwo",
        "component": "Text",
        "content": "第二页内容"
      },
      {
        "id": "pageThree",
        "component": "Text",
        "content": "第三页内容"
      }
    ]
  }
}
]
```

## 组件 Schema

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
          "const": "NavContainer"
        },
        "children": {
          "type": "array",
          "description": "Static child component IDs.",
          "items": {
            "$ref": "../common_types.json#/$defs/ComponentId"
          }
        },
        "currentIndex": {
          "$ref": "../common_types.json#/$defs/DynamicNumber",
          "description": "Index of the currently displayed page."
        },
        "styles": {
          "description": "Shared extended component styles. No dedicated NavContainer style fields are defined currently.",
          "allOf": [
            {
              "$ref": "../common_types.json#/$defs/ExtendedCommonStyles"
            }
          ]
        }
      },
      "required": [
        "component",
        "children",
        "currentIndex"
      ]
    }
  ],
  "additionalProperties": true
}
```

↑ [返回 Reference 总览](../../README.md#reference-api-速查)
