"~[" @punctuation.special
"]" @punctuation.special
"~(" @punctuation.special
")" @punctuation.special
";" @punctuation.delimiter
"." @puncutation.delimiter
":" @punctuation.delimiter

(dat_option_operator) @dat_option_operator
(ps_condition_operator) @operator

(dat_name) @function
(dat_name_part) @property
; ChatGPT recommends drop inline_dat if it over-highlights
(inline_dat) @function

(database_table_name) @type
(database_extension_name) @type
(database_field_name) @variable

(dat_option_name) @attribute
(dat_option_value) @string
(dat_option) @attribute

(tlist_sql) @keyword.control
(tlist_query) @string.special

(tlist_variable) @function
(tlist_variable_option) @attribute
(tlist_template_text) @string

(ps_if_tag) @keyword.control
(ps_if_else_tag) @keyword.control
(ps_if_end_tag) @keyword.control

(ps_condition_path) @variable
(ps_condition_operand) @string
(ps_condition_label) @variable

(square_dat) @function
; TODO: I think this is better served as a variable but I want to experiment with both
(paren_dat) @function

(comment_dat) @comment

; TODO: Why does ChatGPT recommend highlights for HTML?
(tag_name) @tag
(attribute_name) @attribute
(attribute_value) @string
