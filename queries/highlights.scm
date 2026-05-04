[
  "~["
  "]"
  "~("
  ")"
] @punctuation.bracket
[
  ";"
  "."
  ":"
] @punctuation.delimiter
"#" @punctuation.special

(comment_dat) @comment

(paren_dat
  (dat_name)) @variable
(square_dat
  (dat_name)) @function
(dat_option_name) @attribute
(dat_option_operator) @operator
(dat_option_value) @variable.parameter

(database_table_name) @type.builtin
(database_extension_name) @type
(database_field_name) @property

(tlist_sql) @keyword.control
(tlist_template_text) @string

(ps_if_tag) @keyword.control
(ps_if_else_tag) @keyword.control
(ps_if_end_tag) @keyword.control

(ps_condition_path) @variable
(ps_condition_operator) @operator
(ps_condition_operand) @string
(ps_condition_label) @variable

; TODO: Why does ChatGPT recommend highlights for HTML?
(tag_name) @tag
(erroneous_end_tag_name) @tag.error
(doctype) @constant
(attribute_name) @attribute
(attribute_value) @string
(comment) @comment
[
  "<"
  ">"
  "</"
  "/>"
] @punctuation.bracket
