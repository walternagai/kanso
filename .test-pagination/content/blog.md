---
title: Blog
layout: base
pagination:
  collection: posts
  perPage: 5
---

# Blog

{% for post in pagination.items %}
<article><a href="{{ post.url }}">{{ post.title }}</a></article>
{% endfor %}

{% if pagination.prev %}<a href="{{ pagination.prev }}">Previous</a>{% endif %}
{% if pagination.next %}<a href="{{ pagination.next }}">Next</a>{% endif %}