/**
 * @file PowerSchool HTML
 * @author Caleb Frederickson
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const html = require("tree-sitter-html/grammar");

// oxlint-disable no-useless-escape
// tree-sitter requires square bracket open within a NOT range to be escaped again

module.exports = grammar(html, {
  name: "pshtml",

  supertypes: ($) => [$.inline_dat, $.dat],

  extras: ($) => [$.comment, $.comment_dat, /\s+/],

  rules: {
    dat: ($) => choice($.tlist_sql, $.if_block, $.inline_dat),
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
        "~[",
        "tlist_sql",
        ";",
        $.tlist_query,
        repeat(alias($.square_dat_option, $.dat_option)),
        "]",
        $.tlist_template,
        "[/",
        "tlist_sql",
        "]",
      ),
    tlist_query: (_) => /[^;\]]+/,
    tlist_template: ($) =>
      repeat1(
        choice(
          $.if_block,
          $.square_dat,
          $.paren_dat,
          $.element,
          $.entity,
          prec(-1, alias(/[^\[<>&\s~]([^\[<>&~]*[^\[<>&\s~])?/, $.text)),
          prec(-2, alias(/[~<]/, $.text)),
        ),
      ),

    if_block: ($) =>
      seq(
        field("open", $.if_start_tag),
        optional(field("consequent", $.block_content)),
        optional(
          seq(
            field("else_tag", $.else_tag),
            optional(field("alternative", $.block_content)),
          ),
        ),
        field("close", $.if_end_tag),
      ),
    if_start_tag: ($) =>
      seq(
        "~[",
        "if",
        optional(seq("#", alias($.dat_name_part, $.label))),
        ".",
        $.if_condition,
        "]",
      ),
    else_tag: ($) => seq("[", "else", optional($._if_label), "]"),
    if_end_tag: ($) => seq("[/", "if", optional($._if_label), "]"),
    _if_content: ($) =>
      choice(
        $.dat,
        // opening square bracket permitted by spec but to simplify
        // this AST will not parse it. use entity code instead.
        alias(
          choice(/[^\[<>&\s~]([^\[<>&~]*[^\[<>&\s~])?/, prec(-1, "~")),
          $.text,
        ),
        $.element,
        $.script_element,
        $.style_element,
        $.entity,
      ),
    block_content: ($) => repeat1($._if_content),
    _if_label: ($) => seq("#", alias($.dat_name_part, $.label)),

    // TODO: does not handle "in" and "not in " operators. Should add a choice for these.
    condition_lhs: ($) => choice($.inline_dat, /[^=><\]~\s]+/, prec(-1, "~")),
    condition_operator: (_) => choice("=", "<>", ">", "<"),
    condition_rhs: ($) =>
      repeat1(choice($.inline_dat, /[^\]~]+/, prec(-1, "~"))),
    if_condition: ($) =>
      seq(
        $.condition_lhs,
        optional(seq($.condition_operator, optional($.condition_rhs))),
      ),

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
            alias(
              choice($.inline_dat, /[^\];~]+/, prec(-1, "~")),
              $.dat_option_value,
            ),
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
            alias(
              choice($.inline_dat, /[^);~]+/, prec(-1, "~")),
              $.dat_option_value,
            ),
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
          alias(
            repeat1(choice($.dat, /[^"~]+/, prec(-1, "~"))),
            $.attribute_value,
          ),
          '"',
        ),
        seq(
          "'",
          alias(
            repeat1(choice($.dat, /[^'~]+/, prec(-1, "~"))),
            $.attribute_value,
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
