<?php

namespace App\Http\Requests;

use App\Enums\CharacterClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateCharacterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50',
            'race' => 'required|string|max:50',
            'class' => ['required', Rule::enum(CharacterClass::class)],
        ];
    }
}
