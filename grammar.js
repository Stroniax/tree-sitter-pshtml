/**
 * @file PowerSchool HTML
 * @author Caleb Frederickson
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const html = require("tree-sitter-html/grammar");

module.exports = grammar(html, {
  name: "pshtml",

  inline: ($) => [$._ps_condition_label],

  supertypes: ($) => [$.inline_dat],

  extras: ($) => [$.comment, $.comment_dat, /\s+/],

  // oxlint-disable no-useless-escape tree-sitter requires square bracket open within a NOT range to be escaped again
  rules: {
    dat: ($) => choice($.tlist_sql, $.ps_if, $.inline_dat),
    inline_dat: ($) =>
      choice(prec(2, $.database_field_access), $.paren_dat, $.square_dat),

    dat_name_part: (_) => /[a-zA-Z0-9_]+/,

    database_field_access: ($) =>
      seq(
        "~([",
        alias($.dat_name_part, $.database_table_name),
        optional(seq(".", alias($.dat_name_part, $.database_extension_name))),
        "]",
        alias($.dat_name_part, $.database_field_name),
        repeat(alias($.paren_dat_option, $.dat_option)),
        ")",
      ),

    tlist_sql: ($) =>
      seq(
        "~[tlist_sql;",
        $.tlist_query,
        repeat(alias($.square_dat_option, $.dat_option)),
        "]",
        $.tlist_template,
        "[/tlist_sql]",
      ),

    tlist_query: (_) => /[^;\]]+/,
    // For now the template will not "parse" its content except the variables...
    tlist_template: ($) =>
      repeat1(
        choice($.tlist_variable, alias(/[^\[~]+/, $.tlist_template_text)),
      ),
    tlist_variable: ($) =>
      seq(
        "~(",
        $.dat_name,
        repeat(alias($.paren_dat_option, $.dat_option)),
        ")",
      ),

    ps_if: ($) =>
      seq(
        $.ps_if_tag,
        alias(repeat($._node), $.ps_if_content),
        optional(
          seq($.ps_if_else_tag, alias(repeat($._node), $.ps_else_content)),
        ),
        $.ps_if_end_tag,
      ),
    ps_if_tag: ($) =>
      seq("~[if", optional($._ps_condition_label), ".", $.ps_if_condition, "]"),
    ps_if_else_tag: ($) => seq("[else", optional($._ps_condition_label), "]"),
    ps_if_end_tag: ($) => seq("[/if", optional($._ps_condition_label), "]"),
    // TODO: does not handle "in" and "not in " operators. Should add a choice for these.
    ps_if_condition: ($) =>
      seq(
        $.ps_condition_path,
        optional(
          seq($.ps_condition_operator, alias(/[^\]]+/, $.ps_condition_operand)),
        ),
      ),
    _ps_condition_label: ($) =>
      seq("#", alias($.dat_name_part, $.ps_condition_label)),
    ps_condition_operator: (_) => choice("=", "<>", ">", "<"),
    ps_condition_path: ($) =>
      choice($.inline_dat, token(prec(-1, /[^=><\]\s]+/))),

    comment_dat: (_) => seq("~[Comment", choice(":", ";"), /[^\]]+/, "]"),

    square_dat: ($) =>
      seq(
        "~[",
        $.dat_name,
        optional(seq(":", alias($.dat_name, $.dat_target))),
        repeat(alias($.square_dat_option, $.dat_option)),
        "]",
      ),
    paren_dat: ($) =>
      seq(
        "~(",
        $.dat_name,
        repeat(alias($.paren_dat_option, $.dat_option)),
        ")",
      ),
    dat_name: ($) => seq($.dat_name_part, repeat(seq(".", $.dat_name_part))),
    square_dat_option: ($) =>
      seq(
        ";",
        alias(/[^\];:=]+/, $.dat_option_name),
        optional(
          seq(
            alias(choice("=", ":"), $.dat_option_operator),
            alias(choice($.inline_dat, /[^\];]+/), $.dat_option_value),
          ),
        ),
      ),
    paren_dat_option: ($) =>
      seq(
        ";",
        alias(/[^);=]+/, $.dat_option_name),
        optional(
          seq(
            alias("=", $.dat_option_operator),
            alias(choice($.inline_dat, /[^);]+/), $.dat_option_value),
          ),
        ),
      ),

    // HTML overrides
    // The easiest way to parse is to just not permit tilde in a "text" syntax node, though it is technically valid when not followed by open paren or bracket.
    text: (_) =>
      choice(
        /[^\[<>&\s~]([^\[<>&~]*[^\[<>&\s~])?/,
        prec(-1, "["),
        prec(-1, "~"),
      ),
    // Extend HTML node to include DAT, since it is technically valid anywhere in the document
    _node: ($, original) => choice($.dat, /** @type { Rule } */ (original)),
    // Extend quoted attribute value to include DAT within text
    quoted_attribute_value: ($) =>
      choice(
        seq(
          '"',
          optional(
            alias(
              repeat(choice($.dat, /[^"~]/, prec(-1, "~"))),
              $.attribute_value,
            ),
          ),
          '"',
        ),
        seq(
          "'",
          optional(
            alias(
              repeat(choice($.dat, /[^'~]/, prec(-1, "~"))),
              $.attribute_value,
            ),
          ),
          "'",
        ),
      ),
    // Extend attribute itself to permit a DAT as an attribute
    attribute: ($) =>
      choice(
        $.dat,
        seq(
          $.attribute_name,
          optional(
            seq("=", choice($.attribute_value, $.quoted_attribute_value)),
          ),
        ),
      ),
    // Restrict attribute name to not permit tilde, though technically it would be valid without being followed by open paren or bracket
    attribute_name: (_) => /[^<>"'/=~\s]+/,
  },
});
