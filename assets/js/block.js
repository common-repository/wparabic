var isActive = false;
var lastEditor = null;
const { __ } = wp.i18n;
var el = wp.element.createElement;
var BlockControls = wp.editor.BlockControls;
var InspectorControls = wp.editor.InspectorControls;
var components = wp.components;
var TextControl = wp.components.TextControl;
var SelectControl = wp.components.SelectControl;
var RangeControl = wp.components.RangeControl;
/* This section of the code registers a new block, sets an icon and a category, and indicates what type of fields it'll include. */
wp.blocks.registerBlockType("wparabic/wparabic", {
  title: __( 'WP Arabic' ),
  icon: React.createElement("span", {
    class: "wparabic-logo"
  }),
  category: "common",
  presets: ["@wordpress/default"],

  attributes: {
    align: {
      type: "string"
    },
    content: {
      type: "string",
      source: "html",
      selector: "p"
    },
    font_style: {
		type: 'string'
	},
	font_size: {
		type: 'integer'
	},
	line_height: {
		type: 'integer'
	},
  },
  keywords: [
		__( 'WPArabic' ),
		__( 'Arabic' ),
		__( 'Roman Arabic' ),
	],
  edit: function(props) {
    return new ArabicBlockEditor(props);
    // Create block UI using WordPress createElement

  },
  save: function(props) {
    const { align, content } = props.attributes;
    const { font_size, font_style, line_height } = props.attributes;
    let align_class  = null;
    let e_font_size  = null;
    let e_font_style  = null;
    let e_line_height  = null;
    if(typeof align !== "undefined"){
        align_class = align;
    }

    if(typeof font_size !== "undefined"){
       e_font_size = font_size+"px";
    }
    if(typeof font_style !== "undefined"){
         e_font_style = font_style;
    }

    if(typeof line_height !== "undefined"){
       e_line_height = line_height+"px";
    }

    let updated_content = content;
    if (typeof content !== "undefined") {
      updated_content = content.replace("<p>", "").replace("</p>", "");
    }

    return wp.element.createElement(wp.blockEditor.RichText.Content, {
      tagName: "p",
      className: align_class,
      value: updated_content,
      style: {
        fontSize: e_font_size,
        fontFamily: e_font_style,
        lineHeight:e_line_height
    	  }
    });
  }
});

class ArabicBlockEditor extends React.Component {
  constructor(props) {
    super(props);
    this.elementReference = React.createRef();
    this.Id = "arabic-" + props.clientId;
    const editor_id = `.${this.Id}`;
    this.arabic_typing = new translatable_arabic(editor_id);
    this.counter = 0;
  }
  render() {
    const props = this.props;
//     console.log(props.attributes);
    const { align, font_size, font_style, line_height } = props.attributes;
    let align_class  = null;
    let e_font_size  = null;
    let e_font_style  = null;
    let e_line_height  = null;
    if(typeof align === "undefined" || align === "right"){
        align_class = 'right';
    } else {
	    align_class = align;
    }

    if(typeof line_height === "undefined"){
        e_line_height = "28px";
    } else {
	    e_line_height = line_height+"px";
    }
    if(typeof font_size === "undefined"){
        e_font_size = "14px";
    } else {
	    e_font_size = font_size+"px";
    }
    if(typeof font_style === "undefined"){
        e_font_style = "inherit";
    } else {
	    e_font_style = font_style;
    }

//     console.log(align_class);
    return [
      this.toolbar(),
      this.toggleButton(),
      this.changeButton(),
      this.sidebarElements(),
      React.createElement(wp.blockEditor.RichText, {
        multiline: false,
        className: [
          props.className,
          this.Id,
          `text-align-${align_class}`,
          `has-text-align-${align_class}`
        ],
        value: props.attributes.content,
        ref: this.elementReference,
        id: "arabic-" + Date.now(),
        placeholder: __( "Text in arabic" ),
		style: {
            fontSize: e_font_size,
            fontFamily: e_font_style,
            lineHeight:e_line_height
        },
        onChange: function(content) {
          const editor_id = ".arabic-" + props.clientId;
          let updated_content = content;
          if (isActive) {
            // Remove break
            const br_find = new RegExp('<br[^>]*>');
            let content_data = _.compact(content.split(br_find));
            if(content_data.length === 0 ){
              content_data = ['',''];
            }
            if(content_data.length === 1){
              content_data.push('');
            }
            updated_content = content_data[0].replace('/<br[^>]*>/g',' ');
            //Loop and create new blocks
            content_data.forEach((content,index)=>{
              if(index === 0){
                return;
              }
              const WPArabicBlock = wp.blocks.createBlock('wparabic/wparabic',{content});
              props.insertBlocksAfter(WPArabicBlock);
            });
            // Update editor content
            setTimeout(() => {
              jQuery(editor_id).html(updated_content);
            }, 10);
          }

          props.setAttributes({ content: updated_content });
        }
      })
    ];
  }
  sidebarElements() {
	const props = this.props;
	var attributes = props.attributes;
    return el(InspectorControls, {
            key: 'inspector'
        },
        el(components.PanelBody, {
                title: __('WP Arabic Typography', 'wparabic'),
                className: 'block-content',
                initialOpen: true
            },
            el('p', {}, __('Change Typography', 'wparabic')),
            el(SelectControl, {
	            label: __("Font", "olympus-google-fonts"),
                type: "string",
                value: ((attributes.font_style) ? attributes.font_style : "inherit"),
                options: [{
                    label: __('Select Font Family', 'wparabic'),
                    value: "inherit"
                },{
                    label: "BalooBhaijaan",
                    value: "BalooBhaijaan,sans-serif"
                },{
                    label: "Jomhuria",
                    value: "Jomhuria,sans-serif"
                },{
                    label: "Thabit",
                    value: "Thabit,sans-serif"
                },{
                    label: "Scheherazade",
                    value: "Scheherazade,sans-serif"
                }],
                onChange: function(new_font_style) {
                    props.setAttributes({
                        font_style: new_font_style
                    })
                }
            }),
            el(RangeControl, {
                label: __('Font Size', 'wparabic'),
                value: ((attributes.font_size) ? attributes.font_size : 14),
                onChange: function(new_font_size) {
                    props.setAttributes({
                        font_size: new_font_size
                    })
                },
                initialPosition: 14,
                allowReset: !0,
                min: "10",
                max: "50"
            }),
            el(RangeControl, {
                label: __('Line Height', 'wparabic'),
                value: ((attributes.line_height) ? attributes.line_height : 28),
                onChange: function(new_line_height) {
                    props.setAttributes({
                        line_height: new_line_height
                    })
                },
                initialPosition: 28,
                allowReset: !0,
                min: "10",
                max: "100"
            })
        )
    )
  }
  componentDidMount() {
    const editor_id = `.${this.Id}`;
    this.arabic_typing.initialize();

    /* Removes paragraph tags to ensure edit compatibility */
    const { content } = this.props.attributes;
    let updated_content = content;
//     console.log(updated_content);
    if (content !== undefined) {
      updated_content = content.replace("<p>", "").replace("</p>", "");
    }

    // Update Content
    lastEditor = jQuery(editor_id).html(updated_content);

    setTimeout(function() {
      document.querySelector(editor_id).focus();
    }, 10);
  }
  changeButton(){
	if(this.counter == 0){
		const arabic_typing = this.arabic_typing;
		let block_id = `#${this.Id}`;
		block_id = block_id.replace('arabic-','block-');

		const props = this.props;
	    const { align } = props.attributes;
// 	    console.log(align);
	    if(typeof align === "undefined" || align === "right"){

	    } else {
		    setTimeout(() => {
	              jQuery(block_id).find(".wp-arabic-block-editor-button").removeClass("active").addClass("disabled");
				 jQuery(block_id).find(".wp-arabic-block-editor-button").parent().addClass("mce-active");
				 jQuery(block_id).find(".wp-arabic-block-editor-button .text").text(__( "Enable WPArabic" ));
				 arabic_typing.changeState();
	        }, 50);

	    }
	    this.counter++;
    }
  }
  toggleButton() {
  	const props = this.props;
    const { align } = props.attributes;
    const arabic_typing = this.arabic_typing;
    return React.createElement(
      "button",
      {
        className: "wp-arabic-block-editor-button active",
        onClick: function(event) {
          var target = event.target;
          var button = target;

          if (target.tagName != "BUTTON") {
            button = target.parentElement;
          }

          var text = button.querySelector(".text");
          if (!button.classList.contains("disabled")) {
            text.innerText = __( "Enable WPArabic" );
            jQuery(".is-selected .dashicons-editor-alignleft").parent().trigger("click");
          } else {
            text.innerText = __( "Disable WPArabic" );
            if(jQuery(".is-selected .dashicons-editor-aligncenter").parent().hasClass("is-active")){
	            jQuery(".is-selected .dashicons-editor-aligncenter").parent().trigger("click");
            } else {
	            jQuery(".is-selected .dashicons-editor-alignright").parent().trigger("click");
            }
          }
          button.classList.toggle("disabled");
          button.classList.toggle("active");
          button.parentElement.classList.toggle("mce-active");
          arabic_typing.changeState();
        }
      },
      [
        React.createElement("span", {
          className: "wparabic-logo active"
        }),
        React.createElement(
          "span",
          {
            className: "text"
          },
          __( "Disable WPArabic" )
        )
      ]
    );
  }
  toolbar() {
    const props = this.props;
    const { align } = props.attributes;
    //debugger;
    return React.createElement(
      wp.editor.BlockControls,
      {},
      React.createElement(wp.editor.AlignmentToolbar, {
        value: align,
        onChange: align => {
          props.setAttributes({ align: align });
        }
      })
    );
  }
}

jQuery("body").on("keydown", ".wp-block-wparabic-wparabic", function(e) {
  if (e.key == "Enter") {
    isActive = true;
  } else {
    isActive = false;
  }
});
